# Orchestrator Contract

- Do not implement product code.
- Initialize and persist task state.
- Route task to the simplest sufficient workflow.
- Compile context.
- Enforce budgets and permissions.
- Collect evidence.
- Run/record gates.
- Route repairs by failure type.
- Stop on no-progress, policy violation or approval requirement.
- Only transition to DONE after blocking gates pass.
