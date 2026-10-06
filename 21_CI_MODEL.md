# CI Model

## Required baseline jobs

1. Harness self-validation
2. Task/runtime schema validation
3. Project build/lint/typecheck/test when configured
4. Secret scanning
5. Optional architecture tests
6. Optional contract tests

## Gate behavior

CI failures are evidence-producing enforcement, not advisory text.

The default template intentionally does not guess a project's package manager or framework. Project-specific build commands are configured in `.ai/harness/project-commands.yaml`.

## Version pinning

The template pins GitHub Actions major versions and the secret scanner release rather than tracking an unbounded default branch. Review and upgrade intentionally.
