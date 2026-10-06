# Productionization - v4.0

v4.0 converts selected governance from prose into executable enforcement.

## Added

- Harness CLI
- JSON Schema validation
- Task/state/gate/evidence validators
- Change-budget enforcement
- No-progress detection
- Git workspace drift/status reporting
- GitHub Actions baseline CI
- Secret scanning workflow
- Harness self-test fixtures

## CLI

```text
python .ai/cli/harness.py validate task path/to/task.yaml
python .ai/cli/harness.py validate state path/to/state.yaml
python .ai/cli/harness.py validate gate path/to/gate-result.json
python .ai/cli/harness.py validate evidence path/to/evidence.yaml

python .ai/cli/harness.py feature TASK-001
python .ai/cli/harness.py status TASK-001
python .ai/cli/harness.py verify TASK-001
python .ai/cli/harness.py budget TASK-001
python .ai/cli/harness.py no-progress TASK-001
```

## Enforcement principle

If a control can be checked deterministically, CI or the Harness CLI should enforce it rather than relying only on model instructions.
