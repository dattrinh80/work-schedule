#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import yaml
    from jsonschema import Draft202012Validator
except ImportError as exc:
    raise SystemExit("Install .ai/cli/requirements.txt first") from exc

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"
RUNTIME = AI / "runtime"
GRAPHS = AI / "graphs"
SCHEMAS = AI / "schemas"

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

def read_yaml(path: Path) -> Dict[str, Any]:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}

def write_yaml(path: Path, data: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")

def task_dir(task_id: str) -> Path:
    return RUNTIME / "tasks" / task_id

def graph_path(name: str) -> Path:
    return GRAPHS / f"{name}.yaml"

def validate_graph(graph: Dict[str, Any]) -> None:
    schema = json.loads((SCHEMAS / "execution-graph.schema.json").read_text(encoding="utf-8"))
    errors = list(Draft202012Validator(schema).iter_errors(graph))
    if errors:
        msg = "\n".join(f"- {e.message}" for e in errors)
        raise ValueError(f"Invalid execution graph:\n{msg}")

def load_state(task_id: str) -> Dict[str, Any]:
    path = task_dir(task_id) / "state.yaml"
    if not path.exists():
        raise FileNotFoundError(f"Missing state: {path}")
    return read_yaml(path)

def save_state(task_id: str, state: Dict[str, Any]) -> None:
    write_yaml(task_dir(task_id) / "state.yaml", state)

def trace(task_id: str, event: Dict[str, Any]) -> None:
    path = task_dir(task_id) / "trace.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    event = {"time": now(), **event}
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

def checkpoint(task_id: str, label: str) -> Path:
    td = task_dir(task_id)
    state_path = td / "state.yaml"
    cp_dir = RUNTIME / "checkpoints" / task_id
    cp_dir.mkdir(parents=True, exist_ok=True)
    target = cp_dir / f"{label}.yaml"
    shutil.copy2(state_path, target)
    trace(task_id, {"event":"checkpoint","label":label,"path":str(target.relative_to(ROOT))})
    return target

def latest_gate_result(task_id: str, gate_id: str) -> Optional[Dict[str, Any]]:
    gates_dir = task_dir(task_id) / "gates"
    if not gates_dir.exists():
        return None
    matches = sorted(gates_dir.glob(f"{gate_id}*.yaml")) + sorted(gates_dir.glob(f"{gate_id}*.json"))
    if not matches:
        return None
    p = matches[-1]
    if p.suffix == ".json":
        return json.loads(p.read_text(encoding="utf-8"))
    return read_yaml(p)

def set_node(task_id: str, state: Dict[str, Any], node: str) -> None:
    state["current_node"] = node
    state.setdefault("node_history", []).append({"node":node,"time":now()})
    save_state(task_id, state)
    trace(task_id, {"event":"node_enter","node":node})

def init_execution(task_id: str, graph_name: str) -> int:
    graph = read_yaml(graph_path(graph_name))
    validate_graph(graph)
    state = load_state(task_id)
    state["workflow"] = graph_name
    state["workflow_version"] = graph["version"]
    state["current_node"] = graph["entry"]
    state["status"] = "INTAKE"
    state.setdefault("node_history", [])
    state.setdefault("repair_attempts", 0)
    save_state(task_id, state)
    checkpoint(task_id, "init")
    trace(task_id, {"event":"execution_initialized","workflow":graph_name})
    print(f"Initialized {task_id} on workflow {graph_name} at node {graph['entry']}")
    return 0

def advance_action(task_id: str, graph: Dict[str, Any], state: Dict[str, Any], node_name: str) -> int:
    node = graph["nodes"][node_name]
    nxt = node.get("next")
    if not nxt:
        print(f"BLOCK: action node {node_name} has no next transition")
        return 1
    checkpoint(task_id, f"after-{node_name}")
    set_node(task_id, state, nxt)
    print(f"{node_name} -> {nxt}")
    return 0

def advance_gate(task_id: str, graph: Dict[str, Any], state: Dict[str, Any], node_name: str) -> int:
    node = graph["nodes"][node_name]
    gate_id = node["gate"]
    result = latest_gate_result(task_id, gate_id)
    if not result:
        print(f"WAIT: no gate result for {gate_id}. Add a result under .ai/runtime/tasks/{task_id}/gates/")
        return 3
    status = result.get("status")
    nxt = (node.get("on") or {}).get(status)
    if not nxt:
        print(f"BLOCK: no transition for gate status {status}")
        return 1

    state.setdefault("gate_history", []).append({
        "gate_id": gate_id,
        "status": status,
        "failed_rule_ids": result.get("failed_rule_ids", []),
        "time": now(),
    })

    if status == "REPAIR":
        state["repair_attempts"] = int(state.get("repair_attempts", 0)) + 1
    checkpoint(task_id, f"gate-{gate_id}-{status}")
    set_node(task_id, state, nxt)
    print(f"{gate_id} {status} -> {nxt}")
    return 0

def advance_parallel(task_id: str, graph: Dict[str, Any], state: Dict[str, Any], node_name: str) -> int:
    node = graph["nodes"][node_name]
    branches = node.get("branches", [])
    join = node.get("join")
    state["parallel"] = {
        "node": node_name,
        "branches": {b:"PENDING" for b in branches},
        "join": join,
    }
    save_state(task_id, state)
    checkpoint(task_id, f"parallel-{node_name}")
    trace(task_id, {"event":"parallel_ready","node":node_name,"branches":branches,"join":join})
    print("Parallel branches ready:")
    for b in branches:
        print(f"- {b}")
    print(f"Join: {join}")
    return 0

def mark_branch(task_id: str, branch: str, status: str) -> int:
    state = load_state(task_id)
    par = state.get("parallel")
    if not par or branch not in par.get("branches", {}):
        print("BLOCK: branch not active")
        return 1
    par["branches"][branch] = status
    save_state(task_id, state)
    trace(task_id, {"event":"branch_status","branch":branch,"status":status})
    print(f"{branch}: {status}")
    if all(v == "DONE" for v in par["branches"].values()):
        join = par["join"]
        state.pop("parallel", None)
        set_node(task_id, state, join)
        print(f"All branches complete -> {join}")
    return 0

def step(task_id: str) -> int:
    state = load_state(task_id)
    wf = state.get("workflow")
    if not wf:
        print("Task execution not initialized. Run orchestrator init.")
        return 2
    graph = read_yaml(graph_path(wf))
    validate_graph(graph)
    node_name = state.get("current_node")
    node = graph["nodes"].get(node_name)
    if not node:
        print(f"BLOCK: unknown current node {node_name}")
        return 1

    typ = node["type"]
    print(f"Current node: {node_name} ({typ})")

    if typ == "terminal":
        terminal_state = node.get("state", node_name)
        state["status"] = terminal_state
        save_state(task_id, state)
        checkpoint(task_id, f"terminal-{terminal_state}")
        trace(task_id, {"event":"terminal","state":terminal_state})
        print(f"Terminal state: {terminal_state}")
        return 0
    if typ == "action":
        return advance_action(task_id, graph, state, node_name)
    if typ == "gate":
        return advance_gate(task_id, graph, state, node_name)
    if typ == "parallel":
        return advance_parallel(task_id, graph, state, node_name)
    if typ == "approval":
        state["status"] = "WAITING_APPROVAL"
        save_state(task_id, state)
        print("WAITING_APPROVAL")
        return 3

    print(f"Unsupported node type: {typ}")
    return 1

def status(task_id: str) -> int:
    state = load_state(task_id)
    print(yaml.safe_dump(state, sort_keys=False, allow_unicode=True))
    return 0

def resume(task_id: str) -> int:
    state = load_state(task_id)
    print(f"Resume task {task_id}")
    print(f"Workflow: {state.get('workflow')}")
    print(f"Current node: {state.get('current_node')}")
    print(f"Status: {state.get('status')}")
    trace(task_id, {"event":"resume"})
    return 0

def main() -> int:
    ap = argparse.ArgumentParser(prog="orchestrator")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("init")
    p.add_argument("task_id")
    p.add_argument("workflow", choices=["feature","bugfix"])

    p = sub.add_parser("step")
    p.add_argument("task_id")

    p = sub.add_parser("branch")
    p.add_argument("task_id")
    p.add_argument("branch")
    p.add_argument("status", choices=["PENDING","RUNNING","DONE","FAILED"])

    p = sub.add_parser("status")
    p.add_argument("task_id")

    p = sub.add_parser("resume")
    p.add_argument("task_id")

    args = ap.parse_args()
    if args.cmd == "init":
        return init_execution(args.task_id, args.workflow)
    if args.cmd == "step":
        return step(args.task_id)
    if args.cmd == "branch":
        return mark_branch(args.task_id, args.branch, args.status)
    if args.cmd == "status":
        return status(args.task_id)
    if args.cmd == "resume":
        return resume(args.task_id)
    return 2

if __name__ == "__main__":
    raise SystemExit(main())
