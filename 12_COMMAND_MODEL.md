# Command Model

Recommended logical commands:

- /bootstrap
- /feature
- /bugfix
- /refactor
- /migrate
- /ui-refine
- /review
- /verify
- /release
- /resume
- /status

These are logical Harness commands. A runtime adapter may implement them as slash commands, prompts, tasks, scripts or other supported mechanisms.

## Command contract

Each command resolves to:
- workflow
- required inputs
- state transition
- applicable rules
- permitted tools
- expected artifacts
- required gates
- approval boundaries

## Example

`/feature PROJECT-123`

Resolves to:
1. Load task contract
2. Run Requirement Gate
3. Compile context
4. Analyze repository
5. Produce implementation plan
6. Run Architecture Gate
7. Prepare contracts
8. Execute parallel workers where supported
9. Integrate
10. Verify
11. Package evidence
12. Complete only after blocking gates pass
