#!/usr/bin/env python3
from __future__ import annotations
import argparse, subprocess, yaml, json, os
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"

def now(): return datetime.now(timezone.utc).isoformat()
def run(args, cwd=ROOT, check=False):
    p=subprocess.run(args,cwd=cwd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    if check and p.returncode!=0:
        raise RuntimeError(p.stdout)
    return p
def rd(p): return yaml.safe_load(p.read_text(encoding="utf-8")) or {}
def wr(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(yaml.safe_dump(d,sort_keys=False,allow_unicode=True),encoding="utf-8")
def cfg(): return rd(AI/"harness/git-isolation.yaml").get("git_isolation",{})
def taskdir(t): return AI/"runtime/tasks"/t
def meta_path(t,w): return taskdir(t)/"worktrees"/f"{w}.yaml"
def git_head(cwd=ROOT):
    p=run(["git","rev-parse","HEAD"],cwd=cwd,check=True)
    return p.stdout.strip()
def ensure_git():
    p=run(["git","rev-parse","--is-inside-work-tree"])
    if p.returncode!=0 or p.stdout.strip()!="true":
        print("BLOCK: repository is not a Git work tree"); return False
    return True
def ensure_clean_main():
    p=run(["git","status","--porcelain"])
    if p.stdout.strip():
        print("BLOCK: main worktree is dirty")
        print(p.stdout)
        return False
    return True
def create(args):
    if not ensure_git(): return 2
    c=cfg()
    if c.get("require_clean_main_worktree",True) and not ensure_clean_main(): return 1
    base=git_head()
    prefix=c.get("branch_prefix","ai")
    branch=f"{prefix}/{args.task_id}/{args.worker_id}"
    root=Path(c.get("worktree_root","../.ai-worktrees"))
    if not root.is_absolute(): root=(ROOT/root).resolve()
    wt=root/args.task_id/args.worker_id
    wt.parent.mkdir(parents=True,exist_ok=True)
    if wt.exists():
        print("BLOCK: worktree path already exists"); return 1
    p=run(["git","worktree","add","-b",branch,str(wt),base])
    if p.returncode!=0:
        print(p.stdout); return p.returncode
    data={"worker_id":args.worker_id,"task_id":args.task_id,"branch":branch,
          "worktree_path":str(wt),"base_commit":base,"status":"CREATED",
          "head_commit":base,"created_at":now(),"merged_at":None}
    wr(meta_path(args.task_id,args.worker_id),data)
    print(yaml.safe_dump(data,sort_keys=False))
    return 0
def status(args):
    p=meta_path(args.task_id,args.worker_id)
    if not p.exists(): print("Worktree metadata missing"); return 2
    d=rd(p)
    wt=Path(d["worktree_path"])
    if wt.exists():
        h=run(["git","rev-parse","HEAD"],cwd=wt)
        if h.returncode==0: d["head_commit"]=h.stdout.strip()
    wr(p,d)
    print(yaml.safe_dump(d,sort_keys=False)); return 0
def mark_done(args):
    p=meta_path(args.task_id,args.worker_id)
    if not p.exists(): print("Metadata missing"); return 2
    d=rd(p); wt=Path(d["worktree_path"])
    if not wt.exists(): print("BLOCK: worktree missing"); return 1
    s=run(["git","status","--porcelain"],cwd=wt)
    if s.stdout.strip():
        print("BLOCK: uncommitted changes remain in worker worktree")
        print(s.stdout); return 1
    d["head_commit"]=git_head(wt); d["status"]="DONE"; wr(p,d)
    print(f"{args.worker_id}: DONE @ {d['head_commit']}"); return 0
def remove(args):
    p=meta_path(args.task_id,args.worker_id)
    if not p.exists(): print("Metadata missing"); return 2
    d=rd(p); wt=Path(d["worktree_path"])
    if wt.exists():
        q=run(["git","worktree","remove",str(wt)])
        if q.returncode!=0:
            print(q.stdout); return q.returncode
    d["status"]="REMOVED"; wr(p,d); print("Removed"); return 0
def main():
    ap=argparse.ArgumentParser()
    sub=ap.add_subparsers(dest="cmd",required=True)
    for name in ["create","status","mark-done","remove"]:
        p=sub.add_parser(name); p.add_argument("task_id"); p.add_argument("worker_id")
    a=ap.parse_args()
    return {"create":create,"status":status,"mark-done":mark_done,"remove":remove}[a.cmd](a)
if __name__=="__main__":
    raise SystemExit(main())
