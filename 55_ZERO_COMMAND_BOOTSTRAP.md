# Zero-Command Bootstrap

## User experience

After copying the Harness and PRD into a repository:

```text
User: Bootstrap project
```

Expected agent behavior:
1. Load repository instruction file automatically.
2. Read `.ai/ENTRYPOINT.md`.
3. Resolve bootstrap intent.
4. Execute the Harness bootstrap command.
5. Read generated bootstrap artifacts.
6. Continue the bootstrap workflow.
7. Stop only when human input is genuinely required.

If the runtime lacks shell/tool access, the agent must report that limitation and provide the minimum required manual command.
