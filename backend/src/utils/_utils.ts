// utils/_utils.ts
import { z } from "zod";

export const statsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  groupId: z.string().optional(),
});

export function parseRange(query: Record<string, any>) {
  const { from, to, groupId } = statsQuerySchema.parse({
    from: query.from ?? undefined,
    to: query.to ?? undefined,
    groupId: query.groupId ?? undefined,
  });

  const end = to ? new Date(to) : new Date();
  const start = from ? new Date(from) : new Date(end.getTime() - 6 * 24 * 3600 * 1000); // últimos 7 días
  const gid = groupId ? Number(groupId) : undefined;

  return { start, end, groupId: gid };
}
