# Orchestrator Gate Automation

Run a normalized gate with:

```bash
python .ai/cli/gate_runner.py <TASK_ID> <GATE_ID>
```

The runner writes `.ai/runtime/tasks/<TASK_ID>/gates/<GATE_ID>.yaml`. The orchestrator consumes that result on the next graph step.

Mixed gates with incomplete deterministic coverage return `HUMAN_REVIEW` rather than inventing a PASS.
