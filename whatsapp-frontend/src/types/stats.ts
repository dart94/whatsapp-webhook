export type TemplateStatsResult = {
  range: { start: string; end: string };
  filter: { groupId?: number | null };
  totals: { total: number; success: number; failure: number };
  byUser: Array<{ userId: number | null; userName: string | null; total: number; success: number; failure: number }>;
  byGroup: Array<{ groupIntegrationId: number | null; groupId: number | null; groupName: string | null; total: number; success: number; failure: number }>;
  byDay: Array<{ date: string; total: number; success: number; failure: number }>;
};