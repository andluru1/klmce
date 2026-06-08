"use server"

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getStudentData(rollNumber: string = "209Y1A0501") {
  try {
    const student = await prisma.user.findUnique({
      where: { rollNumber },
      include: { fees: true }
    });
    return student;
  } catch (error) {
    console.error("Error fetching student:", error);
    return null;
  }
}
