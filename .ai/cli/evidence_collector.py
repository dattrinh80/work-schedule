#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import argparse, hashlib, yaml
ROOT=Path(__file__).resolve().parents[2]
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for c in iter(lambda:f.read(1048576),b""): h.update(c)
    return h.hexdigest()
def main():
    a=argparse.ArgumentParser(); a.add_argument("task_id"); x=a.parse_args()
    ev=ROOT/".ai/runtime/tasks"/x.task_id/"evidence"; ev.mkdir(parents=True,exist_ok=True)
    items=[]
    for p in sorted(ev.rglob("*")):
        if p.is_file() and p.name!="manifest.yaml":
            items.append({"path":str(p.relative_to(ROOT)).replace("\\","/"),"sha256":sha(p),"size":p.stat().st_size,"kind":p.suffix.lstrip(".") or "file"})
    data={"task_id":x.task_id,"generated_at":datetime.now(timezone.utc).isoformat(),"items":items}
    out=ev/"manifest.yaml"; out.write_text(yaml.safe_dump(data,sort_keys=False),encoding="utf-8")
    print(out.relative_to(ROOT)); print("Evidence items:",len(items))
if __name__=="__main__": main()
