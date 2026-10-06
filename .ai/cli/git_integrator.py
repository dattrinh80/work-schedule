#!/usr/bin/env python3
from __future__ import annotations
import argparse, subprocess, yaml
from pathlib import Path
from datetime import datetime, timezone

ROOT=Path(__file__).resolve().parents[2]
AI=ROOT/".ai"

def now(): return datetime.now(timezone.utc).isoformat()
def run(args,cwd=ROOT): return subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
def rd(p): return yaml.safe_load(p.read_text(encoding="utf-8")) or {}
def wr(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(yaml.safe_dump(d,sort_keys=False,allow_unicode=True),encoding="utf-8")
def tdir(t): return AI/"runtime/tasks"/t

def changed_files(base, head):
    p=run(["git","diff","--name-only",f"{base}..{head}"])
    return [x.strip() for x in p.stdout.splitlines() if x.strip()]

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("task_id"); a=ap.parse_args()
    td=tdir(a.task_id); wd=td/"worktrees"
    if not wd.exists(): print("BLOCK: no worktrees"); return 1
    metas=[]
    for p in sorted(wd.glob("*.yaml")):
        d=rd(p)
        if d.get("status")!="DONE":
            print(f"WAIT: {d.get('worker_id')} status={d.get('status')}"); return 3
        metas.append((p,d))
    if not metas: print("BLOCK: no completed worktrees"); return 1

    # divergence and overlap
    ownership={}
    overlaps=[]
    for _,d in metas:
        base=d["base_commit"]; head=d.get("head_commit") or d["base_commit"]
        # ensure base is ancestor
        anc=run(["git","merge-base","--is-ancestor",base,head])
        if anc.returncode!=0:
            print(f"BLOCK: {d['worker_id']} head does not descend from recorded base"); return 1
        for f in changed_files(base,head):
            if f in ownership and ownership[f]!=d["worker_id"]:
                overlaps.append((f,ownership[f],d["worker_id"]))
            ownership[f]=d["worker_id"]
    ev=td/"evidence"; ev.mkdir(parents=True,exist_ok=True)
    if overlaps:
        out=ev/"integration-overlap-conflicts.txt"
        out.write_text("\n".join(f"{f}: {a} vs {b}" for f,a,b in overlaps),encoding="utf-8")
        print("BLOCK: overlapping changed files")
        for x in overlaps: print("-",x)
        return 1

    # merge workers sequentially, stop on first conflict
    merged=[]
    for p,d in metas:
        branch=d["branch"]
        q=run(["git","merge","--no-ff","--no-edit",branch])
        (ev/f"merge-{d['worker_id']}.log").write_text(q.stdout,encoding="utf-8")
        if q.returncode!=0:
            d["status"]="CONFLICT"; wr(p,d)
            print(f"BLOCK: merge conflict for {branch}")
            return 1
        d["status"]="MERGED"; d["merged_at"]=now(); wr(p,d); merged.append(branch)

    (ev/"integration-merged-branches.txt").write_text("\n".join(merged),encoding="utf-8")
    print("PASS integration merge")
    return 0
if __name__=="__main__":
    raise SystemExit(main())
