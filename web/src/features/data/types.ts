import type { Timestamp } from 'firebase/firestore';
import type { HazardCategory, RiskLevel, InferenceSource, InspectionStatus, Recommendation, CloudAnalysis } from '../../types';

export type ActionStatus = 'open' | 'in_progress' | 'resolved';
export type ActionPriority = Recommendation['priority'];

export interface ActionDoc {
  id: string;
  inspectionId: string;
  ownerId: string;
  teamId?: string;
  title: string;
  description?: string;
  priority?: ActionPriority;
  status: ActionStatus;
  assignee?: string;
  deadline?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InspectionDoc {
  id: string;
  ownerId: string;
  teamId?: string;
  site?: string;
  location?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  inferenceMs?: number;
}