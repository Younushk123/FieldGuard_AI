import {
  collection, query, where, onSnapshot, addDoc, updateDoc, doc,
  serverTimestamp, Timestamp, type Unsubscribe,
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
  onError: (e: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'actions'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ActionDoc);
      onData(items.sort(byNewest));
    },
    onError
  );
}

export function subscribeInspections(
  uid: string,
  onData: (inspections: InspectionDoc[]) => void,
  onError: (e: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'inspections'), where('ownerId', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InspectionDoc);
      onData(items.sort(byNewest));
    },
    onError
  );
}

export function createAction(
  uid: string,
  input: {
    inspectionId: string;
    title: string;
    description?: string;
    priority?: ActionPriority;
    assignee?: string;
    deadline?: Date;
  }
) {
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
  return addDoc(collection(db, 'actions'), data);
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