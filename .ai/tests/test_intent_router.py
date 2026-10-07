#!/usr/bin/env python3
from pathlib import Path
import importlib.util

ROOT=Path(__file__).resolve().parents[2]
ROUTER=ROOT/'.ai/cli/intent_router.py'

spec=importlib.util.spec_from_file_location('intent_router', ROUTER)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

cases={
 'Bootstrap project':'bootstrap',
 'Initialize project':'bootstrap',
 'Build feature: due date':'feature',
 'Fix bug: login broken':'bugfix',
 'Resume project':'resume',
 'Verify project':'verify',
 'Project status':'status',
 'Prepare release':'release',
 'Audit harness':'audit',
 'Khởi tạo dự án':'bootstrap',
}
failed=[]
for text,expected in cases.items():
    got=mod.resolve(text)
    if got!=expected:
        failed.append((text,expected,got))
    else:
        print('PASS',repr(text),'->',got)
if failed:
    print('FAILED',failed)
    raise SystemExit(1)
print('PASS natural-language intent routing')
