# Harness Self Tests

Run:

```bash
pip install -r .ai/cli/requirements.txt
python .ai/cli/harness.py self-test
```

The invalid fixture is expected to fail schema validation; the self-test passes only when this behavior is correctly detected.
