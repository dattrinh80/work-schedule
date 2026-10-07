# Natural-Language Intent Router - v4.1

The user does not need to remember Harness CLI commands.

Example:

```text
Bootstrap project
```

Agent behavior:

```text
Read repository instructions
-> Read .ai/ENTRYPOINT.md
-> Resolve BOOTSTRAP
-> Read .ai/intents/bootstrap.md
-> Execute harness bootstrap
-> Read generated bootstrap prompt
-> Continue autonomously
-> Stop only on Decision Required / Human Approval / BLOCK / missing capability
```

The same contract supports Feature, Bugfix, Resume, Verify, Status, Release and Audit intents.
