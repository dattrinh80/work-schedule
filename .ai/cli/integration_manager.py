#!/usr/bin/env python3
from __future__ import annotations

import argparse, subprocess
from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parents[2]
AI=ROOT/".ai"

def rd(p): return yaml.safe_load(p.read_text(encoding="utf-8")) or {}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("task_id"); a=ap.parse_args()
    wd=AI/"runtime/tasks"/a.task_id/"workers"
    if not wd.exists():
        print("BLOCK: workers directory missing"); return 1
    workers=[rd(p) for p in wd.glob("*.yaml")]
    required=[w for w in workers if w.get("role") in {"frontend","backend","test"}]
    if not required or any(w.get("status")!="DONE" for w in required):
        print("WAIT: required workers incomplete"); return 3

    leases=AI/"runtime/tasks"/a.task_id/"leases"
    active=[]
    if leases.exists():
        for p in leases.glob("*.yaml"):
            x=rd(p)
            if x.get("status")=="ACTIVE": active.append(x.get("worker_id"))
    if active:
        print("BLOCK: active leases remain:", ", ".join(active)); return 1

    # Integration evidence: git status and diff summary
    ev=AI/"runtime/tasks"/a.task_id/"evidence"; ev.mkdir(parents=True,exist_ok=True)
    for name,cmd in {
        "integration-git-status":["git","status","--short"],
        "integration-diff-stat":["git","diff","--stat"],
    }.items():
        p=subprocess.run(cmd,cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
        (ev/f"{name}.log").write_text(p.stdout,encoding="utf-8")
    print("PASS integration preconditions")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
