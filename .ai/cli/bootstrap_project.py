#!/usr/bin/env python3
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AI = ROOT / ".ai"

def run(*args: str) -> int:
    proc = subprocess.run(args, cwd=ROOT)
    return proc.returncode

def main() -> int:
    rc = run(sys.executable, str(AI/"cli"/"detect_project.py"))
    if rc:
        return rc

    generated = AI/"harness"/"project-commands.generated.yaml"
    target = AI/"harness"/"project-commands.yaml"

    if generated.exists():
        print()
        print("Review generated command proposal before applying:")
        print(generated.relative_to(ROOT))
        print()
        print("Harness does NOT overwrite project-commands.yaml automatically.")
        print("After review, merge approved commands into:")
        print(target.relative_to(ROOT))

    print()
    print("Next:")
    print("1. Review detection report.")
    print("2. Resolve high-impact architecture/database/security/UX decisions.")
    print("3. Configure deterministic project commands.")
    print("4. Run Harness self-test and project verification.")
    print("5. Implement one thin vertical slice.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
