# Intent: Bootstrap Project

Trigger examples:
- Bootstrap project
- Initialize project
- Start project from PRD
- Khởi tạo dự án

## Execute

1. Locate the PRD. Prefer `docs/product/prd-master.md`.
2. Run the canonical bootstrap command:
   - `.ai/cli/harness bootstrap`
   - On environments where the wrapper is unavailable: `python .ai/cli/harness_v4.py bootstrap`
3. Read the generated `.ai/runtime/bootstrap/agent-bootstrap-prompt.md`.
4. Continue executing that bootstrap prompt immediately.
5. Stop only on Decision Required, Human Approval, BLOCK, or missing execution capability.

Do not return a tutorial when execution is possible.
Do not begin broad coding before bootstrap gates and high-impact decisions are resolved.
