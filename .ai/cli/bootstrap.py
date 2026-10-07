#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import argparse, subprocess, sys, yaml

ROOT=Path(__file__).resolve().parents[2]
AI=ROOT/".ai"

def run_py(script,*args):
    return subprocess.run([sys.executable,str(AI/"cli"/script),*args],cwd=ROOT).returncode

def main():
    ap=argparse.ArgumentParser(prog="harness bootstrap")
    ap.add_argument("--prd",default="docs/product/prd-master.md")
    ap.add_argument("--skip-audit",action="store_true")
    ap.add_argument("--skip-self-test",action="store_true")
    a=ap.parse_args()

    prd=ROOT/a.prd
    if not prd.exists():
        print(f"BLOCK: PRD not found: {a.prd}")
        print("Place PRD at docs/product/prd-master.md or use --prd <path>.")
        return 2

    if not a.skip_audit:
        print("== Harness audit ==")
        rc=run_py("audit.py")
        if rc: return rc

    if not a.skip_self_test:
        print("== Harness self-test ==")
        rc=run_py("harness.py","self-test")
        if rc: return rc

    print("== Project detection ==")
    rc=run_py("detect_project.py")
    if rc: return rc

    bdir=AI/"runtime"/"bootstrap"
    bdir.mkdir(parents=True,exist_ok=True)
    state={
      "version":"4.1.0",
      "status":"PREPARED",
      "created_at":datetime.now(timezone.utc).isoformat(),
      "prd":str(prd.relative_to(ROOT)).replace("\\","/"),
      "next_action":"START_AGENT_BOOTSTRAP",
      "required_reads":[
        "AGENTS.md","BOOTSTRAP_PROMPT.md",".ai/workflows/bootstrap.yaml",
        ".ai/harness/config.yaml",".ai/runtime/bootstrap/detection-report.md",
        ".ai/runtime/bootstrap/project-profile.yaml"
      ]
    }
    (bdir/"bootstrap-state.yaml").write_text(yaml.safe_dump(state,sort_keys=False,allow_unicode=True),encoding="utf-8")

    prompt=f"""Execute AI Software Development Harness v4.1 bootstrap for this NEW project.

Primary source of truth:
{state['prd']}

Required reads:
- AGENTS.md
- BOOTSTRAP_PROMPT.md
- .ai/workflows/bootstrap.yaml
- .ai/harness/config.yaml
- .ai/runtime/bootstrap/detection-report.md
- .ai/runtime/bootstrap/project-profile.yaml

Mandatory behavior:
1. Treat this as a new-project bootstrap.
2. Do not begin broad implementation immediately.
3. Identify unresolved high-impact product/architecture/database/security/UX decisions.
4. Do not ask again for decisions already answered by the PRD.
5. Persist material decisions in docs/adr/ or docs/decisions/.
6. Establish the minimum approved foundation.
7. After scaffolding, rerun project detection and configure deterministic commands.
8. Build only ONE thin vertical slice first.
9. Run verification and collect evidence.
10. Do not declare PROJECT_READY unless all blocking gates pass.
11. Stop for human approval at Harness approval boundaries.

Begin bootstrap now.
"""
    (bdir/"agent-bootstrap-prompt.md").write_text(prompt,encoding="utf-8")

    print("BOOTSTRAP PREPARED")
    print("- .ai/runtime/bootstrap/bootstrap-state.yaml")
    print("- .ai/runtime/bootstrap/detection-report.md")
    print("- .ai/runtime/bootstrap/project-profile.yaml")
    print("- .ai/runtime/bootstrap/agent-bootstrap-prompt.md")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
