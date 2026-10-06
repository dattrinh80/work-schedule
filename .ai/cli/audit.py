#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import json, sys, yaml, py_compile

ROOT=Path(__file__).resolve().parents[2]
AI=ROOT/".ai"

checks=[]

def record(name, ok, detail=""):
    checks.append((name,ok,detail))

# Required dirs/files
required=[
 AI/"harness/config.yaml",
 AI/"schemas/task.schema.json",
 AI/"schemas/state.schema.json",
 AI/"schemas/gate-result.schema.json",
 AI/"graphs/feature.yaml",
 AI/"cli/harness_v4.py",
 AI/"cli/orchestrator.py",
 AI/"cli/gate_runner.py",
 AI/"cli/worker_engine.py",
 AI/"cli/git_worker.py",
 AI/"cli/worker_launcher.py",
]
for p in required:
    record(str(p.relative_to(ROOT)), p.exists(), "required")

# Compile python
for p in sorted((AI/"cli").glob("*.py")):
    try:
        py_compile.compile(str(p), doraise=True)
        record(f"compile:{p.name}", True)
    except Exception as e:
        record(f"compile:{p.name}", False, str(e))

# JSON schema parse
for p in sorted((AI/"schemas").glob("*.json")):
    try:
        json.loads(p.read_text(encoding="utf-8"))
        record(f"json:{p.name}", True)
    except Exception as e:
        record(f"json:{p.name}", False, str(e))

# YAML parse
for base in [AI/"harness", AI/"gates", AI/"graphs", AI/"commands"]:
    if base.exists():
        for p in sorted(base.rglob("*.yaml")):
            try:
                yaml.safe_load(p.read_text(encoding="utf-8"))
                record(f"yaml:{p.relative_to(AI)}", True)
            except Exception as e:
                record(f"yaml:{p.relative_to(AI)}", False, str(e))

failed=[x for x in checks if not x[1]]
for name,ok,detail in checks:
    print(("PASS" if ok else "FAIL"), name, detail)
print()
print(f"Checks: {len(checks)} | Failed: {len(failed)}")
raise SystemExit(1 if failed else 0)
