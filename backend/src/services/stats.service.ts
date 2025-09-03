import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { logInfo } from "../utils/logger";

export type TemplateStatsInput = {
  start: Date;
  end: Date;
  groupId?: number | null;
  // si necesitas forzar el grupo por seguridad
  forceGroupId?: number | null;
};

export type TemplateStatsResult = {
  range: { start: string; end: string };
  filter: { groupId?: number | null };
  totals: { total: number; success: number; failure: number };
  byUser: Array<{ userId: number | null; userName: string | null; total: number; success: number; failure: number }>;
  byGroup: Array<{ groupIntegrationId: number | null; groupId: number | null; groupName: string | null; total: number; success: number; failure: number }>;
  byDay: Array<{ date: string; total: number; success: number; failure: number }>;
};

const SUCCESS_STATUSES = ["sent", "delivered", "read"] as const;
const FAILURE_STATUS = "error" as const;

export async function getTemplateStatsService(input: TemplateStatsInput): Promise<TemplateStatsResult> {
  const { start, end } = input;

  const effectiveGroupId =
    input.forceGroupId !== undefined && input.forceGroupId !== null
      ? input.forceGroupId
      : input.groupId ?? undefined;

  const whereBase: Prisma.WhatsappMessageWhereInput = {
    createdAt: { gte: start, lt: end },
    type: "template",
    direction: "outbound",
    ...(effectiveGroupId ? { groupIntegrationId: effectiveGroupId } : {}),
  };

  // Totales
  const [total, success, failure] = await Promise.all([
    prisma.whatsappMessage.count({ where: whereBase }),
    prisma.whatsappMessage.count({ where: { ...whereBase, status: { in: [...SUCCESS_STATUSES] } } }),
    prisma.whatsappMessage.count({ where: { ...whereBase, status: FAILURE_STATUS } }),
  ]);

  // Por usuario (total)
  const byUserTotals = await prisma.whatsappMessage.groupBy({
    by: ["sentByUserId"],
    where: whereBase,
    _count: { _all: true },
  });

  // Por usuario (éxito/falla)
  const [byUserSuccess, byUserFailure] = await Promise.all([
    prisma.whatsappMessage.groupBy({
      by: ["sentByUserId"],
      where: { ...whereBase, status: { in: [...SUCCESS_STATUSES] } },
      _count: { _all: true },
    }),
    prisma.whatsappMessage.groupBy({
      by: ["sentByUserId"],
      where: { ...whereBase, status: FAILURE_STATUS },
      _count: { _all: true },
    }),
  ]);

  // Enriquecer con nombres de usuario
  const userIds = Array.from(
    new Set(byUserTotals.map((r) => r.sentByUserId).filter((x): x is number => x !== null))
  );
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const userNameMap = new Map(users.map((u) => [u.id, u.name]));

  const byUserMerged = byUserTotals.map((t) => {
    const succ = byUserSuccess.find((x) => x.sentByUserId === t.sentByUserId)?._count._all ?? 0;
    const fail = byUserFailure.find((x) => x.sentByUserId === t.sentByUserId)?._count._all ?? 0;
    const uid = t.sentByUserId ?? null;
    return {
      userId: uid,
      userName: uid ? userNameMap.get(uid) ?? null : null,
      total: t._count._all,
      success: succ,
      failure: fail,
    };
  });

  // Por grupo (groupIntegrationId) — total/éxito/falla
  const byGroupTotals = await prisma.whatsappMessage.groupBy({
    by: ["groupIntegrationId"],
    where: whereBase,
    _count: { _all: true },
  });

  const [byGroupSuccess, byGroupFailure] = await Promise.all([
    prisma.whatsappMessage.groupBy({
      by: ["groupIntegrationId"],
      where: { ...whereBase, status: { in: [...SUCCESS_STATUSES] } },
      _count: { _all: true },
    }),
    prisma.whatsappMessage.groupBy({
      by: ["groupIntegrationId"],
      where: { ...whereBase, status: FAILURE_STATUS },
      _count: { _all: true },
    }),
  ]);

  // Enriquecer con Group.group.name y groupId
  const giIds = Array.from(
    new Set(byGroupTotals.map((r) => r.groupIntegrationId).filter((x): x is number => x !== null))
  );
  const gis = giIds.length
    ? await prisma.groupIntegration.findMany({
        where: { id: { in: giIds } },
        select: {
          id: true,
          groupId: true,
          group: { select: { id: true, name: true } },
        },
      })
    : [];
  const giMap = new Map(
    gis.map((g) => [
      g.id,
      { groupId: g.groupId ?? null, groupName: g.group?.name ?? null },
    ])
  );

  const byGroupMerged = byGroupTotals.map((t) => {
    const gid = t.groupIntegrationId ?? null;
    const succ = byGroupSuccess.find((x) => x.groupIntegrationId === t.groupIntegrationId)?._count._all ?? 0;
    const fail = byGroupFailure.find((x) => x.groupIntegrationId === t.groupIntegrationId)?._count._all ?? 0;
    const meta = gid ? giMap.get(gid) ?? { groupId: null, groupName: null } : { groupId: null, groupName: null };
    return {
      groupIntegrationId: gid,
      groupId: meta.groupId,
      groupName: meta.groupName,
      total: t._count._all,
      success: succ,
      failure: fail,
    };
  });

  // Serie por día — Postgres con date_trunc (más eficiente)
  type Row = { day: Date; total: bigint; success: bigint; failure: bigint };
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT
      date_trunc('day', "createdAt") AS day,
      COUNT(*) FILTER (WHERE "type" = 'template' AND "direction"='outbound') AS total,
      COUNT(*) FILTER (WHERE "type" = 'template' AND "direction"='outbound' AND "status" IN ('sent','delivered','read')) AS success,
      COUNT(*) FILTER (WHERE "type" = 'template' AND "direction"='outbound' AND "status" = 'error') AS failure
    FROM "WhatsappMessage"
    WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
      ${effectiveGroupId ? Prisma.sql`AND "groupIntegrationId" = ${effectiveGroupId}` : Prisma.empty}
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  const byDay = rows.map((r) => ({
    date: r.day.toISOString().slice(0, 10), // YYYY-MM-DD
    total: Number(r.total),
    success: Number(r.success),
    failure: Number(r.failure),
  }));

  logInfo(
    `✅ Stats plantillas — total:${total} success:${success} failure:${failure} (group:${effectiveGroupId ?? "all"})`
  );

  return {
    range: { start: start.toISOString(), end: end.toISOString() },
    filter: { groupId: effectiveGroupId ?? null },
    totals: { total, success, failure },
    byUser: byUserMerged.sort((a, b) => (b.total - a.total) || (b.success - a.success)),
    byGroup: byGroupMerged.sort((a, b) => (b.total - a.total) || (b.success - a.success)),
    byDay,
  };
}