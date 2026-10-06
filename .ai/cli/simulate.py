#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys, tempfile, shutil, yaml

ROOT=Path(__file__).resolve().parents[2]
AI=ROOT/".ai"
TASK="SIM-001"

def run(args):
    p=subprocess.run([sys.executable,*args],cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    print("$", " ".join(args))
    print(p.stdout)
    return p.returncode

td=AI/"runtime/tasks"/TASK
if td.exists(): shutil.rmtree(td)

if run([str(AI/"cli/harness.py"),"feature",TASK]): raise SystemExit(1)

# Make task valid
task=td/"task.yaml"
d=yaml.safe_load(task.read_text(encoding="utf-8"))
d["title"]="Simulation feature"
d["objective"]="Validate Harness lifecycle plumbing"
d["acceptance_criteria"]=["Simulation artifacts validate"]
d["risk"]="low"
d["unresolved_questions"]=[]
task.write_text(yaml.safe_dump(d,sort_keys=False),encoding="utf-8")

if run([str(AI/"cli/harness.py"),"validate","task",str(task)]): raise SystemExit(1)
if run([str(AI/"cli/orchestrator.py"),"init",TASK,"feature"]): raise SystemExit(1)
if run([str(AI/"cli/orchestrator.py"),"step",TASK]): raise SystemExit(1)

# Automated requirement gate
run([str(AI/"cli/gate_runner.py"),TASK,"G1_REQUIREMENT"])
run([str(AI/"cli/orchestrator.py"),"step",TASK])

print("PASS end-to-end simulation baseline")
raise SystemExit(0)
