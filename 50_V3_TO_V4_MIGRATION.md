# v3.x -> v4.1 Migration

## Canonical entry points

Use:
- `.ai/harness/config.yaml`
- `.ai/cli/harness_v4.py` or `.ai/cli/harness`

Legacy scripts remain usable but are implementation details.

## Recommended migration

1. Back up `.ai/`.
2. Replace Harness core with v4.1.
3. Preserve project-specific `docs/`, task history and project command configuration.
4. Review consolidated config.
5. Run `harness audit`.
6. Run `harness simulate`.
7. Test on one low-risk feature.
