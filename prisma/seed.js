const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const student = await prisma.student.upsert({
    where: { rollNumber: '209Y1A0501' },
    update: {},
    create: {
      rollNumber: '209Y1A0501',
      passwordHash: 'hashed_password_placeholder',
      name: 'Reddy Kumar',
      branch: 'CSE',
      currentSem: 'III-I',
      attendancePct: 68.5,
      busRoute: 'Route 4 - Proddatur',
      busPassValid: true,
      fees: {
        create: [
          {
            feeType: 'JNTU Fee',
            amount: 2000,
            isPaid: false,
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
          },
          {
            feeType: 'Condonation',
            amount: 2500,
            isPaid: false,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 15))
          }
        ]
      }
    }
  })

  console.log('Seeded student:', student)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
