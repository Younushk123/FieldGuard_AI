# FieldGuard Firestore schema (v1) 

Classifier fields use the same names as classifier-schema v1.0.

## inspections/{id}
| Field | Type | Notes |
|---|---|---|
| ownerId | string | auth uid |
| createdAt, updatedAt | timestamp | |
| schemaVersion | string | "1.0" |
| hazardCategory | string | fall, electrical, fire, chemical, mechanical, ergonomic, environmental, other |
| likelihood, severity | int | 1-5 |
| summary, suggestedAction | string | 1-200 chars |
| riskScore | int | likelihood × severity, app-computed |
| riskLevel | string | low 1-4, medium 5-9, high 10-15, critical 16-25, app-computed |
| inferenceSource | string | on-device or cloud, app-set |
| status | string | pending_review or approved |
| reviewedBy, reviewedAt | string, timestamp | set on approval |
| analysis (optional) | map | analysisStatus (pending, done, failed), rationale (string), recommendations (string[]) |

## actions/{id}
| Field | Type | Notes |
|---|---|---|
| inspectionId, ownerId, title | string | |
| status | string | open, in_progress, resolved |
| assignee | string | |
| deadline | timestamp | |
| createdAt, updatedAt | timestamp | |

## Remote Config (integers)
risk_threshold_medium=5, risk_threshold_high=10, risk_threshold_critical=16