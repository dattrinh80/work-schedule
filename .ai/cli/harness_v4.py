#!/usr/bin/env python3
from __future__ import annotations
import argparse, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"

def call(script, args):
    p = subprocess.run([sys.executable, str(AI/"cli"/script), *args], cwd=ROOT)
    return p.returncode

def main():
    ap=argparse.ArgumentParser(prog="harness")
    sub=ap.add_subparsers(dest="cmd", required=True)

    p=sub.add_parser("intent"); p.add_argument("text", nargs="+")
    p=sub.add_parser("bootstrap"); p.add_argument("--prd", default="docs/product/prd-master.md"); p.add_argument("--skip-audit", action="store_true"); p.add_argument("--skip-self-test", action="store_true")
    p=sub.add_parser("detect")
    p=sub.add_parser("self-test")

    p=sub.add_parser("feature"); p.add_argument("task_id")
    p=sub.add_parser("status"); p.add_argument("task_id")
    p=sub.add_parser("verify"); p.add_argument("task_id")

    p=sub.add_parser("orchestrate-init"); p.add_argument("task_id"); p.add_argument("workflow", choices=["feature","bugfix"])
    p=sub.add_parser("step"); p.add_argument("task_id")
    p=sub.add_parser("resume"); p.add_argument("task_id")

    p=sub.add_parser("worker-create"); p.add_argument("task_id"); p.add_argument("worker_id")
    p.add_argument("role"); p.add_argument("objective"); p.add_argument("--path", action="append")
    p=sub.add_parser("worker-claim"); p.add_argument("task_id"); p.add_argument("worker_id")
    p=sub.add_parser("worker-status"); p.add_argument("task_id")

    p=sub.add_parser("git-worker-create"); p.add_argument("task_id"); p.add_argument("worker_id")
    p=sub.add_parser("git-worker-done"); p.add_argument("task_id"); p.add_argument("worker_id")
    p=sub.add_parser("git-integrate"); p.add_argument("task_id")

    p=sub.add_parser("launch"); p.add_argument("task_id"); p.add_argument("worker_id")
    p.add_argument("--runtime", choices=["generic","codex","claude-code"], default="generic")
    p.add_argument("--timeout", type=int); p.add_argument("--dry-run", action="store_true")

    p=sub.add_parser("gate"); p.add_argument("task_id"); p.add_argument("gate_id")
    p=sub.add_parser("evidence"); p.add_argument("task_id")
    p=sub.add_parser("audit")
    p=sub.add_parser("simulate")

    a=ap.parse_args()

    if a.cmd=="intent": return call("intent_router.py", a.text)
    if a.cmd=="bootstrap":
        args=["--prd",a.prd]
        if a.skip_audit: args.append("--skip-audit")
        if a.skip_self_test: args.append("--skip-self-test")
        return call("bootstrap.py", args)
    if a.cmd=="detect": return call("detect_project.py", [])
    if a.cmd=="self-test": return call("harness.py", ["self-test"])
    if a.cmd=="feature": return call("harness.py", ["feature", a.task_id])
    if a.cmd=="status": return call("harness.py", ["status", a.task_id])
    if a.cmd=="verify": return call("harness.py", ["verify", a.task_id])
    if a.cmd=="orchestrate-init": return call("orchestrator.py", ["init",a.task_id,a.workflow])
    if a.cmd=="step": return call("orchestrator.py", ["step",a.task_id])
    if a.cmd=="resume": return call("orchestrator.py", ["resume",a.task_id])
    if a.cmd=="worker-create":
        args=["create",a.task_id,a.worker_id,a.role,a.objective]
        for x in a.path or []: args += ["--path",x]
        return call("worker_engine.py", args)
    if a.cmd=="worker-claim": return call("worker_engine.py", ["claim",a.task_id,a.worker_id])
    if a.cmd=="worker-status": return call("worker_engine.py", ["status",a.task_id])
    if a.cmd=="git-worker-create": return call("git_worker.py", ["create",a.task_id,a.worker_id])
    if a.cmd=="git-worker-done": return call("git_worker.py", ["mark-done",a.task_id,a.worker_id])
    if a.cmd=="git-integrate": return call("git_integrator.py", [a.task_id])
    if a.cmd=="launch":
        args=["launch",a.task_id,a.worker_id,"--runtime",a.runtime]
        if a.timeout: args += ["--timeout",str(a.timeout)]
        if a.dry_run: args += ["--dry-run"]
        return call("worker_launcher.py", args)
    if a.cmd=="gate": return call("gate_runner.py", [a.task_id,a.gate_id])
    if a.cmd=="evidence": return call("evidence_collector.py", [a.task_id])
    if a.cmd=="audit": return call("audit.py", [])
    if a.cmd=="simulate": return call("simulate.py", [])
    return 2

if __name__=="__main__":
    raise SystemExit(main())
