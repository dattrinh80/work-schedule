#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import argparse, subprocess, yaml, sys
ROOT=Path(__file__).resolve().parents[2]; AI=ROOT/".ai"
def rd(p): return yaml.safe_load(p.read_text(encoding="utf-8")) or {}
def wr(p,d): p.parent.mkdir(parents=True,exist_ok=True); p.write_text(yaml.safe_dump(d,sort_keys=False,allow_unicode=True),encoding="utf-8")
def res(g,s,e,failed=None,repair=None,owner=None):
    return {"gate_id":g,"status":s,"severity":"blocking","failed_rule_ids":failed or [],"evidence":e,"repair_instruction":repair,"owner":owner,"timestamp":datetime.now(timezone.utc).isoformat()}
def shell(cmd,label,ev):
    q=subprocess.run(cmd,cwd=ROOT,shell=True,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    p=ev/f"{label}.log"; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(q.stdout,encoding="utf-8")
    return q.returncode,str(p.relative_to(ROOT)).replace("\\","/")
def py(args,label,ev):
    q=subprocess.run([sys.executable,*args],cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    p=ev/f"{label}.log"; p.parent.mkdir(parents=True,exist_ok=True); p.write_text(q.stdout,encoding="utf-8")
    return q.returncode,str(p.relative_to(ROOT)).replace("\\","/")
def commands(): return rd(AI/"harness/project-commands.yaml").get("commands",{})
def taskdir(t): return AI/"runtime/tasks"/t
def requirement(t):
    td=taskdir(t); ev=td/"evidence"; evidence=[]
    rc,p=py([str(AI/"cli/harness.py"),"validate","task",str(td/"task.yaml")],"G1-task-schema",ev); evidence.append(p)
    if rc: return res("G1_REQUIREMENT","BLOCK",evidence,["SCHEMA-001"],"Fix task schema.","planner")
    task=rd(td/"task.yaml")
    if task.get("unresolved_questions"):
        return res("G1_REQUIREMENT","HUMAN_REVIEW",evidence,["REQ-AMBIGUITY"],"Resolve unresolved questions.","product")
    return res("G1_REQUIREMENT","PASS",evidence)
def quality(t):
    td=taskdir(t); ev=td/"evidence"; evidence=[]; failed=[]
    for args,label,rule in [
      ([str(AI/"cli/harness.py"),"budget",t],"G5-budget","CODE-SCOPE-001"),
      ([str(AI/"cli/harness.py"),"no-progress",t],"G5-no-progress","CORE-003")]:
        rc,p=py(args,label,ev); evidence.append(p)
        if rc: failed.append(rule)
    for name in ["build","lint","typecheck","test","contract_test","architecture_test","ui_test"]:
        cmd=str(commands().get(name,"") or "").strip()
        if cmd:
            rc,p=shell(cmd,f"G5-{name}",ev); evidence.append(p)
            if rc: failed.append("CMD-"+name.upper())
    return res("G5_QUALITY","REPAIR" if failed else "PASS",evidence,failed,"Fix failing deterministic checks.","implementation" if failed else None)
def configurable(t,gate,key,owner,rule):
    ev=taskdir(t)/"evidence"; cmd=str(commands().get(key,"") or "").strip()
    if not cmd:
        note=ev/f"{gate}-review-needed.txt"; note.parent.mkdir(parents=True,exist_ok=True); note.write_text(f"No {key} configured.",encoding="utf-8")
        return res(gate,"HUMAN_REVIEW",[str(note.relative_to(ROOT)).replace("\\","/")],[rule+"-MISSING"],f"Configure {key} or review manually.",owner)
    rc,p=shell(cmd,gate+"-"+key,ev)
    return res(gate,"REPAIR" if rc else "PASS",[p],[rule] if rc else [],f"Repair {key} failure." if rc else None,owner if rc else None)
def architecture(t):
    ev=taskdir(t)/"evidence"; evidence=[]
    rc,p=py([str(AI/"cli/harness.py"),"budget",t],"G2-budget",ev); evidence.append(p)
    if rc: return res("G2_ARCHITECTURE","REPAIR",evidence,["CODE-SCOPE-001"],"Reduce scope or approve exception.","planner")
    r=configurable(t,"G2_ARCHITECTURE","architecture_test","architect","ARCH-001"); r["evidence"]=evidence+r["evidence"]; return r
def release(t):
    td=taskdir(t); ev=td/"evidence"; evidence=[]
    rc,p=py([str(AI/"cli/evidence_collector.py"),t],"G9-manifest",ev); evidence.append(p)
    if rc: return res("G9_RELEASE","BLOCK",evidence,["EVIDENCE-MANIFEST"],"Fix evidence collector.","orchestrator")
    bad=[]
    gd=td/"gates"
    if gd.exists():
        for g in gd.glob("*.yaml"):
            x=rd(g)
            if x.get("severity","blocking")=="blocking" and x.get("gate_id")!="G9_RELEASE" and x.get("status")!="PASS":
                bad.append(f"{x.get('gate_id')}={x.get('status')}")
    if bad:
        n=ev/"G9-blocking.txt"; n.write_text("\n".join(bad),encoding="utf-8"); evidence.append(str(n.relative_to(ROOT)).replace("\\","/"))
        return res("G9_RELEASE","BLOCK",evidence,["BLOCKING-GATE"],"Resolve blocking gates.","orchestrator")
    return res("G9_RELEASE","PASS",evidence)
def main():
    a=argparse.ArgumentParser(); a.add_argument("task_id"); a.add_argument("gate_id"); x=a.parse_args()
    if not taskdir(x.task_id).exists(): print("Task not initialized"); return 2
    runners={
      "G1_REQUIREMENT":requirement,
      "G2_ARCHITECTURE":architecture,
      "G4_CONTRACT":lambda t:configurable(t,"G4_CONTRACT","contract_test","contract-owner","CONTRACT-TEST"),
      "G5_QUALITY":quality,
      "G7_SECURITY":lambda t:configurable(t,"G7_SECURITY","security_test","security","SECURITY-TEST"),
      "G8_UI":lambda t:configurable(t,"G8_UI","ui_test","frontend","UI-TEST"),
      "G9_RELEASE":release}
    if x.gate_id not in runners: print("Unsupported gate"); return 2
    d=runners[x.gate_id](x.task_id); out=taskdir(x.task_id)/"gates"/f"{x.gate_id}.yaml"; wr(out,d)
    print(yaml.safe_dump(d,sort_keys=False,allow_unicode=True))
    return 0 if d["status"]=="PASS" else 1
if __name__=="__main__": raise SystemExit(main())
