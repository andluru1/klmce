'use server';

import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function processMockPayment(feeId: string, userId: string, amount: number) {
  // 1. Verify Session
  const session = await verifySession();
  if (!session || session.role !== 'STUDENT') {
    throw new Error('Unauthorized or Invalid Session');
  }

  // 2. Simulate Network Delay (Payment Gateway Processing)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 3. Generate Mock Receipt and Gateway Reference
  const receiptNumber = `RCPT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const gatewayRef = `pay_${Math.random().toString(36).substring(2, 14)}`;

  try {
    // 4. Create the Transaction Record
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.userId,
        amount: amount,
        status: 'SUCCESS',
        receiptNumber: receiptNumber,
        gatewayReference: gatewayRef,
      },
    });

    // 4.5. Mark the Fee as Paid
    await prisma.fee.update({
      where: { id: feeId },
      data: {
        isPaid: true,
        paidDate: new Date(),
        paymentMode: 'Mock Gateway',
        paymentRef: receiptNumber
      }
    });

    // 5. Revalidate Paths
    revalidatePath('/student/fees');
    revalidatePath('/student/finance');
    revalidatePath('/admin/finance');

    return { 
      success: true, 
      receiptNumber: transaction.receiptNumber,
      gatewayReference: transaction.gatewayReference 
    };
  } catch (error) {
    console.error('Payment Processing Failed:', error);
    return { success: false, error: 'Payment failed due to internal error.' };
  }
}

export async function payGlobalDues(amount: number) {
  const session = await verifySession();
  if (!session || session.role !== 'STUDENT') {
    return { success: false, error: 'Unauthorized' };
  }

  // Find all unpaid fees
  const pendingFees = await prisma.fee.findMany({
    where: { userId: session.userId, isPaid: false }
  });

  if (pendingFees.length === 0) {
    return { success: false, error: 'No pending dues found.' };
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  const receiptNumber = `RCPT-GLB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const gatewayRef = `pay_glb_${Math.random().toString(36).substring(2, 14)}`;

  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.userId,
        amount: amount,
        status: 'SUCCESS',
        receiptNumber,
        gatewayReference: gatewayRef,
      },
    });

    // Mark all as paid
    for (const fee of pendingFees) {
      await prisma.fee.update({
        where: { id: fee.id },
        data: {
          isPaid: true,
          paidDate: new Date(),
          paymentMode: 'Global Gateway',
          paymentRef: receiptNumber
        }
      });
    }

    revalidatePath('/student/fees');
    revalidatePath('/student/finance');
    revalidatePath('/admin/finance');

    return { 
      success: true, 
      receiptNumber: transaction.receiptNumber,
      gatewayReference: transaction.gatewayReference 
    };
  } catch (error) {
    return { success: false, error: 'Payment failed.' };
  }
}

export async function generateTallyXML() {
  const transactions = await prisma.transaction.findMany({
    where: { status: 'SUCCESS' },
    include: { user: true }
  });

  if (transactions.length === 0) return null;

  let xml = `<?xml version="1.0" ?>\n<ENVELOPE>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDATA>\n`;
  for (const txn of transactions) {
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
    xml += `          <VOUCHER VCHTYPE="Receipt" ACTION="Create">\n`;
    xml += `            <DATE>${txn.transactionDate.toISOString().split('T')[0].replace(/-/g, '')}</DATE>\n`;
    xml += `            <PARTYLEDGERNAME>${txn.user.name}</PARTYLEDGERNAME>\n`;
    xml += `            <AMOUNT>${txn.amount}</AMOUNT>\n`;
    xml += `            <NARRATION>Payment Ref: ${txn.gatewayReference}</NARRATION>\n`;
    xml += `          </VOUCHER>\n`;
    xml += `        </TALLYMESSAGE>\n`;
  }
  xml += `      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`;

  return xml;
}
