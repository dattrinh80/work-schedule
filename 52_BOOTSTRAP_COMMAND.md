# harness bootstrap

Default:

```bash
.ai/cli/harness bootstrap
```

Windows:

```bash
python .ai/cli/harness_v4.py bootstrap
```

Custom PRD:

```bash
python .ai/cli/harness_v4.py bootstrap --prd docs/product/todo-prd.md
```

This command validates the PRD, runs audit and self-test, auto-detects the repository, creates bootstrap state, and generates a Coding Agent bootstrap prompt.
