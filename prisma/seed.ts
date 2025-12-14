import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create demo restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-restaurant' },
    update: {},
    create: {
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      averageMinutesPerParty: 10,
    },
  })

  console.log('Created restaurant:', restaurant.name)

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin@123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Link admin to restaurant
  await prisma.userRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: adminUser.id,
        restaurantId: restaurant.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      restaurantId: restaurant.id,
    },
  })

  console.log('Linked admin to restaurant')

  // Optionally create some sample queue entries for testing
  const sampleEntries = [
    {
      name: 'John Doe',
      mobileNumber: '+1234567890',
      partySize: 2,
      seatingType: 'Indoor' as const,
      tokenNumber: 'A001',
      positionSnapshot: 1,
    },
    {
      name: 'Jane Smith',
      mobileNumber: '+1234567891',
      partySize: 4,
      seatingType: 'Outdoor' as const,
      tokenNumber: 'A002',
      positionSnapshot: 2,
    },
  ]

  for (const entry of sampleEntries) {
    // Check if entry already exists
    const existing = await prisma.queueEntry.findFirst({
      where: {
        restaurantId: restaurant.id,
        tokenNumber: entry.tokenNumber,
      },
    })

    if (!existing) {
      await prisma.queueEntry.create({
        data: {
          restaurantId: restaurant.id,
          ...entry,
          status: 'WAITING',
        },
      })
    }
  }

  console.log('Created sample queue entries')

  console.log('Database seed completed!')
  console.log('\nLogin credentials:')
  console.log('Email: admin@example.com')
  console.log('Password: Admin@123')
  console.log('\nRestaurant URL: http://localhost:3000/demo-restaurant')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

