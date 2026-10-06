# Repair Routing

Repair routing is based on the failed gate or node owner.

| Failure | Default owner |
|---|---|
| Requirement ambiguity | Product/Human |
| Architecture gate | Planner/Architect |
| Contract gate | Contract preparation |
| Frontend verification | Frontend worker |
| Backend verification | Backend worker |
| Test failure | Test owner + affected implementation worker |
| Security gate | Security reviewer + responsible worker |
| UI gate | Frontend/UX |
| Migration failure | Database/Migration owner |

Repeated identical blocking failures trigger no-progress handling and escalation.
