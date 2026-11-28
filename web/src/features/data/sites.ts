import type { InspectionDoc } from './types.ts';

export type Workspace = 'Plant 1' | 'Plant 2' | 'Plant 3' | 'Offshore Delta';
export type SiteSelection = 'All' | Workspace | string;

export const WORKSPACE_SITE_NAMES: Record<Workspace, string> = {
  'Plant 1': 'Plant 1, Assembly Line',
  'Plant 2': 'Plant 2, Industrial Zone',
  'Plant 3': 'Plant 3, Chemical Storage',
  'Offshore Delta': 'Offshore Platform Delta',
};

export function isWorkspace(value: string): value is Workspace {
  return Object.prototype.hasOwnProperty.call(WORKSPACE_SITE_NAMES, value);
}

export function siteLabelForSelection(selection: SiteSelection): string {
  if (selection === 'All') return 'All plants';
  return isWorkspace(selection) ? WORKSPACE_SITE_NAMES[selection] : selection;
}

const SITE_ALIASES: Record<Workspace, string[]> = {
  'Plant 1': ['Plant 1, Assembly Line', 'Plant 1'],
  'Plant 2': ['Plant 2, Industrial Zone', 'Plant 2'],
  'Plant 3': ['Plant 3, Chemical Storage', 'Plant 3'],
  'Offshore Delta': ['Offshore Platform Delta', 'Offshore Delta'],
};

function containsAlias(text: string, alias: string): boolean {
  const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, 'i').test(text);
}

export function workspaceForInspection(inspection: InspectionDoc): Workspace | null {
  if (inspection.site) {
    return (Object.entries(WORKSPACE_SITE_NAMES) as [Workspace, string][])
      .find(([workspace, site]) => inspection.site === site || inspection.site === workspace)?.[0] ?? null;
  }

  const text = `${inspection.reportText}\n${inspection.summary}`.toLowerCase();
  const matches = (Object.entries(SITE_ALIASES) as [Workspace, string[]][])
    .filter(([, aliases]) => aliases.some((alias) => containsAlias(text, alias)));
  return matches.length === 1 ? matches[0][0] : null;
}

export function inspectionMatchesWorkspace(inspection: InspectionDoc, workspace: SiteSelection): boolean {
  if (workspace === 'All') return true;
  if (inspection.site === workspace) return true;
  if (isWorkspace(workspace)) return workspaceForInspection(inspection) === workspace;
  const text = `${inspection.site || ''}\n${inspection.reportText}\n${inspection.summary}`.toLowerCase();
  return text.includes(workspace.toLowerCase());
}
