#!/usr/bin/env python3
from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"

def now():
    return datetime.now(timezone.utc).isoformat()

def rd(path: Path) -> Dict[str, Any]:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}

def wr(path: Path, data: Dict[str, Any]):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")

def task_dir(task_id: str) -> Path:
    return AI / "runtime" / "tasks" / task_id

def worker_file(task_id: str, worker_id: str) -> Path:
    return task_dir(task_id) / "workers" / f"{worker_id}.yaml"

def worktree_file(task_id: str, worker_id: str) -> Path:
    return task_dir(task_id) / "worktrees" / f"{worker_id}.yaml"

def worker_run_dir(task_id: str, worker_id: str) -> Path:
    p = task_dir(task_id) / "workers" / worker_id
    p.mkdir(parents=True, exist_ok=True)
    return p

def build_prompt(task_id: str, worker_id: str, worker: Dict[str, Any]) -> str:
    role = worker.get("role")
    allowed = "\n".join(f"- {x}" for x in worker.get("allowed_paths", [])) or "- none"
    return f"""You are a Harness worker.

Task ID: {task_id}
Worker ID: {worker_id}
Role: {role}
Objective: {worker.get('objective','')}

Allowed write paths:
{allowed}

Mandatory rules:
1. Work only inside the assigned worktree.
2. Modify only allowed paths.
3. Do not silently change approved contracts.
4. Do not make unrelated refactors.
5. Run branch-level verification before reporting completion.
6. Do not claim the overall task is DONE.
7. Do not access production systems or credentials.
8. Persist any required evidence under the worker run directory when instructed.

Complete the assigned work item and summarize:
- changed files
- verification performed
- residual risks
- any contract/architecture issue requiring escalation
"""

def load_runtime_config(runtime: str):
    cfg = rd(AI / "harness" / "runtime-supervisor.yaml")
    sup = cfg.get("runtime_supervisor", {})
    runtimes = cfg.get("runtimes", {})
    if runtime not in runtimes:
        raise ValueError(f"Unknown runtime: {runtime}")
    return sup, runtimes[runtime]

def set_worker_status(task_id: str, worker_id: str, status: str):
    wf = worker_file(task_id, worker_id)
    w = rd(wf)
    w["status"] = status
    wr(wf, w)

def launch(args):
    wf = worker_file(args.task_id, args.worker_id)
    wt_meta = worktree_file(args.task_id, args.worker_id)
    if not wf.exists():
        print("BLOCK: worker metadata missing")
        return 2
    if not wt_meta.exists():
        print("BLOCK: worktree metadata missing")
        return 2

    worker = rd(wf)
    wt = rd(wt_meta)
    worktree = Path(wt.get("worktree_path",""))
    if not worktree.exists():
        print("BLOCK: assigned worktree does not exist")
        return 1

    runtime = args.runtime
    sup, rcfg = load_runtime_config(runtime)

    timeout = args.timeout or int(sup.get("default_timeout_seconds", 1800))
    max_timeout = int(sup.get("max_timeout_seconds", 7200))
    if timeout > max_timeout:
        print(f"BLOCK: timeout {timeout}s exceeds max {max_timeout}s")
        return 1

    command = str(rcfg.get("command","") or "").strip()
    if not command:
        print(f"BLOCK: runtime command not configured: {runtime}")
        return 1

    if runtime == "claude-code" and rcfg.get("max_turns"):
        command = command + f" --max-turns {int(rcfg['max_turns'])}"

    run_dir = worker_run_dir(args.task_id, args.worker_id)
    prompt = build_prompt(args.task_id, args.worker_id, worker)
    (run_dir / "prompt.md").write_text(prompt, encoding="utf-8")

    launch_data = {
        "task_id": args.task_id,
        "worker_id": args.worker_id,
        "runtime": runtime,
        "worktree_path": str(worktree),
        "status": "QUEUED",
        "timeout_seconds": timeout,
        "command": command,
        "started_at": None,
        "finished_at": None,
        "exit_code": None,
    }
    wr(run_dir / "launch.yaml", launch_data)

    dry = args.dry_run or bool(sup.get("dry_run_by_default", True))
    if dry:
        print("DRY RUN")
        print("Worktree:", worktree)
        print("Command:", command)
        print("Prompt:", run_dir / "prompt.md")
        return 0

    launch_data["status"] = "STARTING"
    launch_data["started_at"] = now()
    wr(run_dir / "launch.yaml", launch_data)
    set_worker_status(args.task_id, args.worker_id, "RUNNING")

    env = os.environ.copy()
    # Never serialize environment to logs.
    try:
        proc = subprocess.run(
            shlex.split(command),
            cwd=worktree,
            input=prompt,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            env=env,
        )
        (run_dir / "stdout.log").write_text(proc.stdout, encoding="utf-8")
        (run_dir / "stderr.log").write_text(proc.stderr, encoding="utf-8")
        launch_data["finished_at"] = now()
        launch_data["exit_code"] = proc.returncode

        if proc.returncode == 0:
            launch_data["status"] = "SUCCEEDED"
            set_worker_status(args.task_id, args.worker_id, "VERIFYING")
        else:
            launch_data["status"] = "FAILED"
            set_worker_status(args.task_id, args.worker_id, "FAILED")
        wr(run_dir / "launch.yaml", launch_data)
        print(yaml.safe_dump(launch_data, sort_keys=False))
        return proc.returncode
    except subprocess.TimeoutExpired as exc:
        (run_dir / "stdout.log").write_text(exc.stdout or "", encoding="utf-8")
        (run_dir / "stderr.log").write_text(exc.stderr or "", encoding="utf-8")
        launch_data["finished_at"] = now()
        launch_data["status"] = "TIMED_OUT"
        launch_data["exit_code"] = None
        wr(run_dir / "launch.yaml", launch_data)
        set_worker_status(args.task_id, args.worker_id, "BLOCKED")
        print(f"TIMED_OUT after {timeout}s")
        return 124

def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("launch")
    p.add_argument("task_id")
    p.add_argument("worker_id")
    p.add_argument("--runtime", choices=["generic","codex","claude-code"], default="generic")
    p.add_argument("--timeout", type=int)
    p.add_argument("--dry-run", action="store_true")

    args = ap.parse_args()
    if args.cmd == "launch":
        return launch(args)
    return 2

if __name__ == "__main__":
    raise SystemExit(main())
