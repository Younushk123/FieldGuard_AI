import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../lib/firebase';
import type { CaptureResult } from './ai';

// Turn on only after Maaz has added inferenceMs to the schema and deployed the rules.
const SAVE_INFERENCE_MS = true;

export async function saveInspection(reportText: string, r: CaptureResult, site: string, location: string, teamId?: string | null) {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error('Please sign in first.');

  const data: Record<string, unknown> = {
    ownerId: uid,
    site,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    reportText,
    schemaVersion: r.schemaVersion,
    hazardCategory: r.hazardCategory,
    likelihood: r.likelihood,
    severity: r.severity,
    summary: r.summary,
    suggestedAction: r.suggestedAction,
    riskScore: r.riskScore,
    riskLevel: r.riskLevel,
    inferenceSource: r.inferenceSource,
    status: 'pending_review',
  };
  if (location.trim()) data.location = location.trim();
  if (teamId) data.teamId = teamId;
  if (SAVE_INFERENCE_MS) data.inferenceMs = Math.min(Math.round(r.inferenceMs), 120000);

  return addDoc(collection(db, 'inspections'), data);}