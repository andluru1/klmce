import prisma from './prisma';
import { verifySession } from './session';

export async function getSessionUser() {
  const session = await verifySession();

  if (!session || !session.userId) return null;

  return await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      department: true,
      classSection: true
    }
  });
}
