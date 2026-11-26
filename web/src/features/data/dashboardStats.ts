import type { HazardCategory, RiskLevel } from '../../types';
import type { ActionDoc, InspectionDoc } from './types.ts';

export type Period = 'month' | '30d' | 'all';
export interface CategoryRow { key: string; label: string; count: number }

const DAY = 86_400_000;
const ms = (t?: { toMillis(): number } | null) => t?.toMillis() ?? 0;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function inPeriod(i: InspectionDoc, p: Period, now: number): boolean {
  const t = ms(i.createdAt);
  if (p === 'all') return true;
  if (p === '30d') return t >= now - 30 * DAY;
  const d = new Date(now);
  return t >= new Date(d.getFullYear(), d.getMonth(), 1).getTime() && t < new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
}

export function computeStats(inspections: InspectionDoc[], actions: ActionDoc[], period: Period, now = Date.now()) {
  const newest = [...inspections].sort((a, b) => ms(b.createdAt) - ms(a.createdAt));
  const hazards = newest.filter((i) => i.riskLevel !== 'low'); // hazard = medium risk or above
  const highRisk = newest.filter((i) => i.riskLevel === 'high' || i.riskLevel === 'critical');
  const openActions = actions.filter((a) => a.status !== 'resolved');

  const byLevel: Record<RiskLevel, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  newest.forEach((i) => { byLevel[i.riskLevel] += 1; });

  const counts = new Map<HazardCategory, number>();
  hazards.filter((i) => inPeriod(i, period, now)).forEach((i) => counts.set(i.hazardCategory, (counts.get(i.hazardCategory) ?? 0) + 1));
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.filter(([k]) => k !== 'other').slice(0, 4);
  const categoryTotal = sorted.reduce((s, [, n]) => s + n, 0);
  const categories: CategoryRow[] = top.map(([k, n]) => ({ key: k, label: cap(k), count: n }));
  const rest = categoryTotal - top.reduce((s, [, n]) => s + n, 0);
  if (rest > 0) categories.push({ key: 'other', label: 'Other', count: rest });

  return {
    total: newest.length,
    last30: newest.filter((i) => ms(i.createdAt) >= now - 30 * DAY).length,
    hazards: hazards.length,
    highRisk: highRisk.length,
    highRiskPending: highRisk.filter((i) => i.status === 'pending_review').length,
    openActions: openActions.length,
    dueSoon: openActions.filter((a) => a.deadline && ms(a.deadline) <= now + 7 * DAY).length,
    byLevel,
    categories,
    categoryTotal,
    recent: newest.filter((i) => ms(i.createdAt) >= now - 3 * DAY).slice(0, 10),
    findings: [...hazards].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5),
  };
}
export type Stats = ReturnType<typeof computeStats>;
