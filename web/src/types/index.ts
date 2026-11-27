import type { Timestamp } from 'firebase/firestore';

export type HazardCategory =
  | 'fall'
  | 'electrical'
  | 'fire'
  | 'chemical'
  | 'mechanical'
  | 'ergonomic'
  | 'environmental'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type InferenceSource = 'on-device' | 'cloud';

export type InspectionStatus = 'pending_review' | 'approved';

export interface Classification {
  schemaVersion: '1.0';
  hazardCategory: HazardCategory;
  likelihood: number;
  severity: number;
  summary: string;
  suggestedAction: string;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: 'immediate' | 'short_term' | 'long_term';
  suggestedDueDays: number;
}

export interface CloudAnalysis {
  schemaVersion: '1.0';
  hazardCategory: HazardCategory;
  likelihood: number;
  severity: number;
  summary: string;
  suggestedAction: string;
  rationale: string;
  recommendations: Recommendation[];
  requiresImmediateAction?: boolean;
  uncertaintyNotes?: string | null;
}

export interface InspectionRecord {
  id?: string;
  ownerId?: string;
  reportText: string;
  schemaVersion: '1.0';
  hazardCategory: HazardCategory;
  likelihood: number;
  severity: number;
  summary: string;
  suggestedAction: string;
  riskScore: number;
  riskLevel: RiskLevel;
  inferenceSource: InferenceSource;
  status: InspectionStatus;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  analysis?: CloudAnalysis;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  inferenceMs?: number;
}
