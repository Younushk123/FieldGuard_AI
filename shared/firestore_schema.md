# FieldGuard Firestore schema (v1) 

Field names match classifier-schema v1.0 and cloud-analyst-schema v1.0.

## inspections/{id}
| Field | Type | Notes |
|---|---|---|
| ownerId | string | auth uid |
| createdAt, updatedAt | timestamp | |
| reportText | string | the inspector's report |
| schemaVersion | string | "1.0" |
| hazardCategory | string | fall, electrical, fire, chemical, mechanical, ergonomic, environmental, other |
| likelihood, severity | int | 1-5 |
| summary, suggestedAction | string | 1-200 chars |
| riskScore | int | likelihood × severity, app-computed |
| riskLevel | string | low 1-4, medium 5-9, high 10-15, critical 16-25, app-computed |
| inferenceSource | string | on-device or cloud, app-set |
| status | string | pending_review or approved |
| reviewedBy, reviewedAt | string, timestamp | set on approval |
| analysis (optional) | map | cloud only, see below |

### analysis (map, cloud only)
| Field | Type | Notes |
|---|---|---|
| analysisStatus | string | pending, done, failed (app-set) |
| rationale | string | max 500 chars |
| recommendations | array of maps | 1-5 items: title (max 80), description (max 300), priority (immediate, short_term, long_term), suggestedDueDays (int 0-90) |
| requiresImmediateAction | bool, optional | |
| uncertaintyNotes | string or null, optional | max 300 chars |

## actions/{id}
| Field | Type | Notes |
|---|---|---|
| inspectionId, ownerId, title | string | |
| description | string, optional | |
| priority | string, optional | immediate, short_term, long_term |
| status | string | open, in_progress, resolved |
| assignee | string | |
| deadline | timestamp | approval date + suggestedDueDays |
| createdAt, updatedAt | timestamp | |

## Remote Config (integers)
risk_threshold_medium=5, risk_threshold_high=10, risk_threshold_critical=16