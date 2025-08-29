// services/authz.ts
import {prisma} from "../prisma";

export async function getUserGroupIdOrThrow(userId: number): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { groupId: true },
  });
  if (!user?.groupId) {
    const err: any = new Error("User has no associated group");
    err.code = "NO_GROUP";
    throw err;
  }
  return user.groupId;
}
