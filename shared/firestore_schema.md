# FieldGuard Firestore schema (v1) 

Field names match classifier-schema v1.0 and cloud-analyst-schema v1.0.

## inspections/{id}
| Field | Type | Notes |
|---|---|---|
| ownerId | string | auth uid |
| site | string, optional | selected facility; e.g. "Plant 1, Assembly Line" |
| location | string, optional | inspector-entered location within the site |
| createdAt, updatedAt | timestamp | |
| reportText | string | the inspector's report |
| schemaVersion | string | "1.0" |
| hazardCategory | string | fall, electrical, fire, chemical, mechanical, ergonomic, environmental, other |
| likelihood, severity | int | 1-5 |
| summary, suggestedAction | string | 1-200 chars |
| riskScore | int | likelihood × severity, app-computed |
| riskLevel | string | low 1-4, medium 5-9, high 10-15, critical 16-25, app-computed |
| inferenceSource | string | on-device or cloud, app-set |
| inferenceMS | int,optional | model time in milliseconds, 0-120000, app-measured|
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

## customSites/{id}
| Field | Type | Notes |
|---|---|---|
| ownerId | string | auth uid; only this user can access the site |
| name | string | user-created plant or site name, 1-80 characters |
| createdAt, updatedAt | timestamp | |

## teams/{teamId}
| Field | Type | Notes |
|---|---|---|
| name | string | corporate account name |
| managerUid | string | user uid that manages the team |
| createdAt, updatedAt | timestamp | |

## users/{uid}
| Field | Type | Notes |
|---|---|---|
| uid | string | Firebase Authentication uid |
| email | string | member login email |
| role | string | manager or member |
| teamId | string | shared corporate team identifier |
| teamName | string, optional | corporate account name |
| status | string | active or disabled |
| createdAt, updatedAt | timestamp | |

## teamInvites/{code}
| Field | Type | Notes |
|---|---|---|
| teamId | string | team selected when a member registers |
| active | bool | invite availability |
| createdAt, updatedAt | timestamp | |

## Remote Config (integers)
risk_threshold_medium=5, risk_threshold_high=10, risk_threshold_critical=16