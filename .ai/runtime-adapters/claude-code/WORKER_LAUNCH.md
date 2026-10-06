# Claude Code Worker Launch

The supervisor supports Claude Code through a configurable command template.

Default template:

```text
claude -p --permission-mode default --output-format json
```

Where supported, the supervisor may append a configured `--max-turns` value.

The command is intentionally configurable because CLI capabilities can vary by installed version.

Do not use permission-bypass modes as the default.
