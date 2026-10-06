#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List

try:
    import yaml
    from jsonschema import Draft202012Validator
except ImportError as exc:
    print("Missing CLI dependencies. Run: pip install -r .ai/cli/requirements.txt", file=sys.stderr)
    raise SystemExit(2) from exc

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"
SCHEMAS = AI / "schemas"
RUNTIME = AI / "runtime"
HARNESS = AI / "harness"

SCHEMA_MAP = {
    "task": SCHEMAS / "task.schema.json",
    "state": SCHEMAS / "state.schema.json",
    "gate": SCHEMAS / "gate-result.schema.json",
    "evidence": SCHEMAS / "evidence.schema.json",
    "approval": SCHEMAS / "approval-request.schema.json",
    "contract-change": SCHEMAS / "contract-change-request.schema.json",
}

def read_data(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(str(path))
    text = path.read_text(encoding="utf-8")
    if path.suffix.lower() == ".json":
        return json.loads(text)
    return yaml.safe_load(text)

def write_yaml(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")

def validate(kind: str, target: Path) -> int:
    schema_path = SCHEMA_MAP[kind]
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    data = read_data(target)
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errors:
        print(f"FAIL {kind}: {target}")
        for err in errors:
            loc = ".".join(str(x) for x in err.path) or "<root>"
            print(f"- {loc}: {err.message}")
        return 1
    print(f"PASS {kind}: {target}")
    return 0

def task_dir(task_id: str) -> Path:
    return RUNTIME / "tasks" / task_id

def init_feature(task_id: str) -> int:
    td = task_dir(task_id)
    td.mkdir(parents=True, exist_ok=True)
    task_path = td / "task.yaml"
    state_path = td / "state.yaml"

    if not task_path.exists():
        template = read_data(AI / "templates" / "task.yaml")
        template["id"] = task_id
        write_yaml(task_path, template)

    if not state_path.exists():
        state = {
            "task_id": task_id,
            "status": "CREATED",
            "workflow_version": "3.3.0",
            "iterations": 0,
            "changed_files": [],
            "blocking_issues": [],
            "gate_history": [],
        }
        write_yaml(state_path, state)

    (td / "evidence").mkdir(exist_ok=True)
    (td / "contracts").mkdir(exist_ok=True)
    print(f"Initialized feature task: {task_id}")
    print(f"- {task_path.relative_to(ROOT)}")
    print(f"- {state_path.relative_to(ROOT)}")
    return 0

def git(args: List[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

def changed_files() -> List[str]:
    proc = git(["status", "--porcelain"])
    if proc.returncode != 0:
        return []
    result = []
    for line in proc.stdout.splitlines():
        if not line.strip():
            continue
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        result.append(path)
    return result

def load_budgets() -> Dict[str, Any]:
    return read_data(HARNESS / "budgets.yaml")

def budget_check(task_id: str) -> int:
    state_path = task_dir(task_id) / "state.yaml"
    if not state_path.exists():
        print(f"BLOCK: missing state for {task_id}")
        return 2
    state = read_data(state_path)
    budgets = load_budgets().get("defaults", {})
    max_files = int(budgets.get("max_changed_files", 20))
    files = changed_files()
    count = len(files)
    print(f"Changed files: {count}/{max_files}")
    for f in files:
        print(f"- {f}")
    if count > max_files:
        print("BLOCK: change budget exceeded")
        return 1
    return 0

def status(task_id: str) -> int:
    td = task_dir(task_id)
    state_path = td / "state.yaml"
    if not state_path.exists():
        print(f"Task {task_id}: NOT_INITIALIZED")
        return 2
    state = read_data(state_path)
    print(f"Task: {task_id}")
    print(f"Status: {state.get('status')}")
    print(f"Iterations: {state.get('iterations', 0)}")
    print(f"Blocking issues: {len(state.get('blocking_issues', []))}")
    print("Gate history:")
    for item in state.get("gate_history", []):
        print(f"- {item}")
    files = changed_files()
    print(f"Workspace changed files: {len(files)}")
    return 0

def required_evidence_complete(data: Dict[str, Any]) -> List[str]:
    missing = []
    if not data.get("changed_files"):
        missing.append("changed_files")
    if not data.get("verification"):
        missing.append("verification")
    if "residual_risks" not in data:
        missing.append("residual_risks")
    return missing

def evidence_check(task_id: str) -> int:
    td = task_dir(task_id)
    candidates = [td / "evidence.yaml", td / "evidence" / "evidence.yaml", td / "evidence.json"]
    target = next((p for p in candidates if p.exists()), None)
    if not target:
        print("BLOCK: evidence package not found")
        return 1
    rc = validate("evidence", target)
    if rc:
        return rc
    data = read_data(target)
    missing = required_evidence_complete(data)
    if missing:
        print("BLOCK: incomplete evidence:", ", ".join(missing))
        return 1
    print("PASS evidence completeness")
    return 0

def no_progress(task_id: str) -> int:
    state_path = task_dir(task_id) / "state.yaml"
    if not state_path.exists():
        print("BLOCK: state missing")
        return 2
    state = read_data(state_path)
    limit = int(load_budgets().get("defaults", {}).get("no_progress_limit", 2))
    history = state.get("gate_history", [])
    signatures = []
    for item in history:
        if isinstance(item, dict):
            status_v = item.get("status")
            failed = tuple(item.get("failed_rule_ids", []) or [])
            if status_v in {"REPAIR", "BLOCK"}:
                signatures.append((item.get("gate_id"), status_v, failed))
    if len(signatures) >= limit and len(set(signatures[-limit:])) == 1:
        print(f"HUMAN_REVIEW: same blocking failure repeated {limit} times")
        return 1
    print("PASS no-progress check")
    return 0

def run_cmd(label: str, command: str, evidence_dir: Path) -> int:
    if not command.strip():
        print(f"SKIP {label}: not configured")
        return 0
    print(f"RUN {label}: {command}")
    proc = subprocess.run(command, cwd=ROOT, shell=True, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    evidence_dir.mkdir(parents=True, exist_ok=True)
    (evidence_dir / f"{label}.log").write_text(proc.stdout, encoding="utf-8")
    print(proc.stdout, end="")
    if proc.returncode == 0:
        print(f"PASS {label}")
    else:
        print(f"FAIL {label}: exit {proc.returncode}")
    return proc.returncode

def verify(task_id: str) -> int:
    td = task_dir(task_id)
    if not td.exists():
        print(f"Task {task_id} not initialized")
        return 2

    rc = validate("task", td / "task.yaml")
    if rc:
        return rc
    rc = validate("state", td / "state.yaml")
    if rc:
        return rc
    rc = budget_check(task_id)
    if rc:
        return rc
    rc = no_progress(task_id)
    if rc:
        return rc

    cfg = read_data(HARNESS / "project-commands.yaml") or {}
    cmds = cfg.get("commands", {})
    evidence_dir = td / "evidence"
    failures = 0
    for label in ["build", "lint", "typecheck", "test", "contract_test", "architecture_test", "ui_test"]:
        failures += 1 if run_cmd(label, str(cmds.get(label, "")), evidence_dir) else 0

    if failures:
        print(f"REPAIR: {failures} verification command(s) failed")
        return 1

    print("PASS deterministic verification baseline")
    return 0

def self_test() -> int:
    fixtures = AI / "tests" / "fixtures"
    checks = [
        ("task", fixtures / "valid-task.yaml", 0),
        ("task", fixtures / "invalid-task.yaml", 1),
        ("state", fixtures / "valid-state.yaml", 0),
        ("gate", fixtures / "valid-gate.json", 0),
        ("evidence", fixtures / "valid-evidence.yaml", 0),
    ]
    failed = 0
    for kind, path, expected in checks:
        rc = validate(kind, path)
        if (rc == 0) != (expected == 0):
            failed += 1
    if failed:
        print(f"FAIL self-test: {failed} mismatch(es)")
        return 1
    print("PASS Harness self-test")
    return 0

def main() -> int:
    parser = argparse.ArgumentParser(prog="harness", description="AI Software Development Harness CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_val = sub.add_parser("validate")
    p_val.add_argument("kind", choices=SCHEMA_MAP.keys())
    p_val.add_argument("path")

    p_feature = sub.add_parser("feature")
    p_feature.add_argument("task_id")

    p_status = sub.add_parser("status")
    p_status.add_argument("task_id")

    p_verify = sub.add_parser("verify")
    p_verify.add_argument("task_id")

    p_budget = sub.add_parser("budget")
    p_budget.add_argument("task_id")

    p_np = sub.add_parser("no-progress")
    p_np.add_argument("task_id")

    sub.add_parser("self-test")

    args = parser.parse_args()

    if args.command == "validate":
        return validate(args.kind, Path(args.path))
    if args.command == "feature":
        return init_feature(args.task_id)
    if args.command == "status":
        return status(args.task_id)
    if args.command == "verify":
        return verify(args.task_id)
    if args.command == "budget":
        return budget_check(args.task_id)
    if args.command == "no-progress":
        return no_progress(args.task_id)
    if args.command == "self-test":
        return self_test()
    return 2

if __name__ == "__main__":
    raise SystemExit(main())
