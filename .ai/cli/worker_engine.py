#!/usr/bin/env python3
from __future__ import annotations

import argparse, fnmatch, json, os
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List

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

def workers_dir(task_id: str) -> Path:
    p = task_dir(task_id) / "workers"
    p.mkdir(parents=True, exist_ok=True)
    return p

def leases_dir(task_id: str) -> Path:
    p = task_dir(task_id) / "leases"
    p.mkdir(parents=True, exist_ok=True)
    return p

def worker_path(task_id: str, worker_id: str) -> Path:
    return workers_dir(task_id) / f"{worker_id}.yaml"

def list_active_leases(task_id: str):
    result=[]
    for p in leases_dir(task_id).glob("*.yaml"):
        x=rd(p)
        if x.get("status")=="ACTIVE":
            result.append((p,x))
    return result

def patterns_overlap(a: str, b: str) -> bool:
    # Conservative overlap detector for common glob shapes.
    if a == b or a == "**" or b == "**":
        return True
    pa=a.replace("**","").rstrip("/*")
    pb=b.replace("**","").rstrip("/*")
    return pa.startswith(pb) or pb.startswith(pa)

def lease_conflicts(task_id: str, worker_id: str, paths: List[str]) -> List[str]:
    conflicts=[]
    for _,lease in list_active_leases(task_id):
        if lease.get("worker_id")==worker_id:
            continue
        for p in paths:
            for q in lease.get("paths",[]):
                if patterns_overlap(p,q):
                    conflicts.append(f"{p} overlaps {q} owned by {lease.get('worker_id')}")
    return conflicts

def create_worker(args):
    p=worker_path(args.task_id,args.worker_id)
    if p.exists():
        print("Worker already exists")
        return 1
    data={
      "id":args.worker_id,"task_id":args.task_id,"role":args.role,"status":"PENDING",
      "objective":args.objective,"allowed_paths":args.path or [],
      "forbidden_paths":[],"depends_on":[],"contract_versions":{},"evidence":[]
    }
    wr(p,data)
    print(p.relative_to(ROOT))
    return 0

def claim(args):
    p=worker_path(args.task_id,args.worker_id)
    if not p.exists():
        print("Worker not found"); return 2
    w=rd(p)
    paths=w.get("allowed_paths",[])
    conflicts=lease_conflicts(args.task_id,args.worker_id,paths)
    if conflicts:
        print("BLOCK: lease conflict")
        for c in conflicts: print("-",c)
        return 1
    lease_id=f"LEASE-{args.worker_id}"
    lp=leases_dir(args.task_id)/f"{lease_id}.yaml"
    lease={"lease_id":lease_id,"task_id":args.task_id,"worker_id":args.worker_id,
           "paths":paths,"status":"ACTIVE","created_at":now(),"released_at":None}
    wr(lp,lease)
    w["status"]="CLAIMED"; wr(p,w)
    print(f"Claimed {args.worker_id}")
    return 0

def set_status(args):
    p=worker_path(args.task_id,args.worker_id)
    if not p.exists(): print("Worker not found"); return 2
    w=rd(p); w["status"]=args.status; wr(p,w)
    print(f"{args.worker_id}: {args.status}")
    return 0

def release(args):
    found=False
    for p,lease in list_active_leases(args.task_id):
        if lease.get("worker_id")==args.worker_id:
            lease["status"]="RELEASED"; lease["released_at"]=now(); wr(p,lease); found=True
    print("Released" if found else "No active lease")
    return 0

def status(args):
    rows=[]
    for p in sorted(workers_dir(args.task_id).glob("*.yaml")):
        w=rd(p); rows.append((w.get("id"),w.get("role"),w.get("status")))
    for r in rows: print(" | ".join(str(x) for x in r))
    if not rows: print("No workers")
    return 0

def join_check(args):
    workers=[rd(p) for p in workers_dir(args.task_id).glob("*.yaml")]
    required=[w for w in workers if w.get("role") in {"frontend","backend","test"}]
    if not required:
        print("BLOCK: no required workers configured"); return 1
    bad=[f"{w.get('id')}={w.get('status')}" for w in required if w.get("status")!="DONE"]
    if bad:
        print("WAIT: required workers not done")
        for x in bad: print("-",x)
        return 3
    print("PASS: required workers DONE")
    return 0

def main():
    ap=argparse.ArgumentParser()
    sub=ap.add_subparsers(dest="cmd",required=True)

    p=sub.add_parser("create"); p.add_argument("task_id"); p.add_argument("worker_id")
    p.add_argument("role",choices=["frontend","backend","test","migration","ui","integration"])
    p.add_argument("objective"); p.add_argument("--path",action="append")

    p=sub.add_parser("claim"); p.add_argument("task_id"); p.add_argument("worker_id")
    p=sub.add_parser("status"); p.add_argument("task_id")
    p=sub.add_parser("join-check"); p.add_argument("task_id")

    p=sub.add_parser("set-status"); p.add_argument("task_id"); p.add_argument("worker_id")
    p.add_argument("status",choices=["PENDING","CLAIMED","RUNNING","VERIFYING","DONE","FAILED","BLOCKED","CANCELLED"])

    p=sub.add_parser("release"); p.add_argument("task_id"); p.add_argument("worker_id")

    a=ap.parse_args()
    if a.cmd=="create": return create_worker(a)
    if a.cmd=="claim": return claim(a)
    if a.cmd=="set-status": return set_status(a)
    if a.cmd=="release": return release(a)
    if a.cmd=="status": return status(a)
    if a.cmd=="join-check": return join_check(a)
    return 2

if __name__=="__main__":
    raise SystemExit(main())
