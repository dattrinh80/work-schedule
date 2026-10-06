#!/usr/bin/env python3
from __future__ import annotations
import argparse, yaml
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"

def rd(p): return yaml.safe_load(p.read_text(encoding="utf-8")) or {}

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("task_id")
    a=ap.parse_args()
    base=AI/"runtime/tasks"/a.task_id/"workers"
    if not base.exists():
        print("No worker runtime data")
        return 0

    rows=[]
    for d in sorted(base.iterdir()):
        if not d.is_dir(): continue
        lp=d/"launch.yaml"
        if lp.exists():
            x=rd(lp)
            rows.append((x.get("worker_id"),x.get("runtime"),x.get("status"),x.get("exit_code")))
    if not rows:
        print("No launch records")
        return 0
    for r in rows:
        print(" | ".join("" if x is None else str(x) for x in r))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
