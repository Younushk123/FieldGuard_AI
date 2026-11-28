import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
  runTransaction, serverTimestamp, Timestamp, type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { ActionDoc, ActionPriority, ActionStatus, InspectionDoc } from './types.ts';

const byNewest = <T extends { createdAt: Timestamp }>(a: T, b: T) =>
  b.createdAt.toMillis() - a.createdAt.toMillis();

// Every query filters by ownerId: the rules reject any query that doesn't.
// Sorting happens in the browser so no composite index is needed.
export function subscribeActions(
  uid: string,
  onData: (actions: ActionDoc[]) => void,
  onError: (e: Error) => void,
  teamId?: string | null
): Unsubscribe {
  const q = teamId
    ? query(collection(db, 'actions'), where('teamId', '==', teamId))
    : query(collection(db, 'actions'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as ActionDoc);
      onData(items.sort(byNewest));
    },
    onError
  );
}

export function subscribeInspections(
  uid: string,
  onData: (inspections: InspectionDoc[]) => void,
  onError: (e: Error) => void,
  teamId?: string | null
): Unsubscribe {
  const q = teamId
    ? query(collection(db, 'inspections'), where('teamId', '==', teamId))
    : query(collection(db, 'inspections'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }) as InspectionDoc);
      onData(items.sort(byNewest));
    },
    onError
  );
}

export function subscribeInspection(
  uid: string,
  inspectionId: string,
  onData: (inspection: InspectionDoc | null) => void,
  onError: (e: Error) => void,
  teamId?: string | null
): Unsubscribe {
  return onSnapshot(
    doc(db, 'inspections', inspectionId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const data = snap.data();
      if (teamId ? data.teamId !== teamId : data.ownerId !== uid) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data({ serverTimestamps: 'estimate' }) } as InspectionDoc);
    },
    onError
  );
}

type NewAction = {
    inspectionId: string;
    title: string;
    description?: string;
    priority?: ActionPriority;
    assignee?: string;
    deadline?: Date;
    teamId?: string | null;
};

function actionData(uid: string, input: NewAction) {
  const data: Record<string, unknown> = {
    inspectionId: input.inspectionId,
    ownerId: uid,
    title: input.title,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (input.description) data.description = input.description;
  if (input.priority) data.priority = input.priority;
  if (input.assignee) data.assignee = input.assignee;
  if (input.deadline) data.deadline = Timestamp.fromDate(input.deadline);
  if (input.teamId) data.teamId = input.teamId;
  return data;
}

export function createAction(uid: string, input: NewAction) {
  return addDoc(collection(db, 'actions'), actionData(uid, input));
}

export function createActionOnce(uid: string, input: NewAction, actionKey: string) {
  const id = encodeURIComponent(`${uid}:${input.inspectionId}:${actionKey}`);
  const actionRef = doc(db, 'actions', id);
  const data = actionData(uid, input);

  return runTransaction(db, async (transaction) => {
    const existing = await transaction.get(actionRef);
    if (!existing.exists()) transaction.set(actionRef, data);
  });
}

export function approveInspection(inspectionId: string, uid: string) {
  return updateDoc(doc(db, 'inspections', inspectionId), {
    status: 'approved',
    reviewedBy: uid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function updateAction(
  id: string,
  patch: { status?: ActionStatus; assignee?: string; deadline?: Date }
) {
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.status) data.status = patch.status;
  if (patch.assignee !== undefined) data.assignee = patch.assignee;
  if (patch.deadline) data.deadline = Timestamp.fromDate(patch.deadline);
  return updateDoc(doc(db, 'actions', id), data);
}

export function subscribeCustomSites(
  uid: string,
  onData: (names: string[]) => void,
  onError: (e: Error) => void,
  teamId?: string | null
): Unsubscribe {
  const q = teamId
    ? query(collection(db, 'customSites'), where('teamId', '==', teamId))
    : query(collection(db, 'customSites'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const names = snap.docs
        .map((d) => d.data().name)
        .filter((name): name is string => typeof name === 'string' && name.length > 0);
      onData([...new Set(names)].sort((a, b) => a.localeCompare(b)));
    },
    onError
  );
}

export function createCustomSite(uid: string, name: string, teamId?: string | null) {
  const data: Record<string, unknown> = {
    ownerId: uid,
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (teamId) data.teamId = teamId;
  return addDoc(collection(db, 'customSites'), data);
}