'use server';

import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function submitLeaveRequest(data: {
  startDate: Date;
  endDate: Date;
  reason: string;
}) {
  const session = await getSessionUser();
  if (!session || session.role !== 'FACULTY') return { error: 'Unauthorized' };

  try {
    await prisma.leaveRequest.create({
      data: {
        facultyId: session.id,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason,
        status: 'PENDING_HOD'
      }
    });

    revalidatePath('/faculty/leaves');
    return { success: true };
  } catch (error) {
    console.error('Error submitting leave:', error);
    return { error: 'Failed to submit leave request' };
  }
}

export async function sendLeaveMessage(leaveId: string, message: string) {
  const session = await getSessionUser();
  if (!session) return { error: 'Unauthorized' };

  try {
    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
      include: { faculty: true }
    });

    if (!leave) return { error: 'Leave not found' };

    await prisma.leaveMessage.create({
      data: {
        leaveId,
        senderId: session.id,
        message
      }
    });

    // Notification Logic
    if (session.id === leave.facultyId) {
      // Sender is the Applicant. Notify the HOD of that department.
      const hod = await prisma.user.findFirst({
        where: { isHOD: true, departmentId: leave.faculty.departmentId }
      });
      if (hod) {
        await prisma.notification.create({
          data: {
            recipientId: hod.id,
            title: `New Message from ${leave.faculty.name}`,
            message: `You have a new message regarding a leave request from ${leave.faculty.name}.`,
            type: 'GENERAL'
          }
        });
      }
    } else {
      // Sender is HOD/Admin. Notify the Applicant.
      await prisma.notification.create({
        data: {
          recipientId: leave.facultyId,
          title: `Update on your Leave Request`,
          message: `Your HOD or an Admin left a comment on your leave request.`,
          type: 'GENERAL'
        }
      });
    }

    revalidatePath('/faculty/leaves');
    revalidatePath('/faculty/hod');
    revalidatePath('/admin/academics/leaves');
    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Failed to send message' };
  }
}

export async function updateLeaveStatus(leaveId: string, action: 'HOD_APPROVE' | 'ADMIN_APPROVE' | 'REJECT') {
  const session = await getSessionUser();
  if (!session) return { error: 'Unauthorized' };

  // Fetch the current leave request to verify department
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { faculty: true }
  });

  if (!leave) return { error: 'Leave request not found' };

  // Security Check: To HOD Approve, user must be an HOD in the same department
  if (action === 'HOD_APPROVE') {
    const approver = await prisma.user.findUnique({ where: { id: session.id } });
    if (!approver?.isHOD || approver.departmentId !== leave.faculty.departmentId) {
      return { error: 'Unauthorized: Only the HOD of this department can approve.' };
    }
    
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'HOD_APPROVED' }
    });
  } 
  
  // Security Check: To Admin Approve, user must be an ADMIN
  else if (action === 'ADMIN_APPROVE') {
    if (session.role !== 'ADMIN') return { error: 'Unauthorized: Only an Admin can give final approval.' };
    
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED' }
    });
  } 
  
  // Security Check: To Reject, user must be the HOD of the department OR an Admin
  else if (action === 'REJECT') {
    const approver = await prisma.user.findUnique({ where: { id: session.id } });
    const isDeptHOD = approver?.isHOD && approver.departmentId === leave.faculty.departmentId;
    
    if (session.role !== 'ADMIN' && !isDeptHOD) {
      return { error: 'Unauthorized to reject this leave.' };
    }
    
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'REJECTED' }
    });
  }

  revalidatePath('/faculty/leaves');
  revalidatePath('/faculty/hod');
  revalidatePath('/admin/academics/leaves');
  return { success: true };
}
