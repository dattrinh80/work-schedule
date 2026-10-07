# Generic Feature Command

Execute the FEATURE workflow under AI Software Development Harness v4.1.

Inputs:
- task ID or task contract
- repository
- approved project sources of truth

Required behavior:
1. Load task contract and state.
2. Run Requirement Gate.
3. Compile only relevant context.
4. Analyze repository impact.
5. Produce implementation plan.
6. Run Architecture Gate before source edits.
7. Prepare/confirm feature contracts.
8. Execute workers within permissions and change budget.
9. Integrate and run deterministic verification.
10. Route failures through bounded repair.
11. Build evidence package.
12. Do not mark DONE unless all blocking gates pass.
13. Stop for required human approval.
