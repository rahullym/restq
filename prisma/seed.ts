import { PrismaClient, RestaurantRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create 2 Restaurants
  const restaurant1 = await prisma.restaurant.upsert({
    where: { slug: 'demo-restaurant' },
    update: {},
    create: {
      name: 'Demo Restaurant',
      slug: 'demo-restaurant',
      status: 'ACTIVE',
      averageMinutesPerParty: 10,
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { slug: 'second-restaurant' },
    update: {},
    create: {
      name: 'Second Restaurant',
      slug: 'second-restaurant',
      status: 'ACTIVE',
      averageMinutesPerParty: 15,
    },
  })

  console.log('Created restaurants:', restaurant1.name, 'and', restaurant2.name)

  // Create SUPER_ADMIN user
  const superAdminPasswordHash = await bcrypt.hash('SuperAdmin@123', 10)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      passwordHash: superAdminPasswordHash,
      status: 'ACTIVE',
      role: 'ADMIN', // Legacy field, role is in UserRestaurant
    },
  })

  // Assign SUPER_ADMIN to restaurant1
  await prisma.userRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: superAdmin.id,
        restaurantId: restaurant1.id,
      },
    },
    update: { role: RestaurantRole.SUPER_ADMIN },
    create: {
      userId: superAdmin.id,
      restaurantId: restaurant1.id,
      role: RestaurantRole.SUPER_ADMIN,
    },
  })

  console.log('Created SUPER_ADMIN:', superAdmin.email)

  // Create RESTAURANT_ADMIN user (assigned to both restaurants)
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10)
  const restaurantAdmin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Restaurant Admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      status: 'ACTIVE',
      role: 'ADMIN',
    },
  })

  // Assign RESTAURANT_ADMIN to restaurant1
  await prisma.userRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: restaurantAdmin.id,
        restaurantId: restaurant1.id,
      },
    },
    update: { role: RestaurantRole.RESTAURANT_ADMIN },
    create: {
      userId: restaurantAdmin.id,
      restaurantId: restaurant1.id,
      role: RestaurantRole.RESTAURANT_ADMIN,
    },
  })

  // Assign RESTAURANT_ADMIN to restaurant2
  await prisma.userRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: restaurantAdmin.id,
        restaurantId: restaurant2.id,
      },
    },
    update: { role: RestaurantRole.RESTAURANT_ADMIN },
    create: {
      userId: restaurantAdmin.id,
      restaurantId: restaurant2.id,
      role: RestaurantRole.RESTAURANT_ADMIN,
    },
  })

  console.log('Created RESTAURANT_ADMIN:', restaurantAdmin.email, '(assigned to both restaurants)')

  // Create STAFF user (assigned to restaurant1 only)
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      name: 'Staff Member',
      email: 'staff@example.com',
      passwordHash: staffPasswordHash,
      status: 'ACTIVE',
      role: 'ADMIN',
    },
  })

  await prisma.userRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: staff.id,
        restaurantId: restaurant1.id,
      },
    },
    update: { role: RestaurantRole.STAFF },
    create: {
      userId: staff.id,
      restaurantId: restaurant1.id,
      role: RestaurantRole.STAFF,
    },
  })

  console.log('Created STAFF:', staff.email, '(assigned to restaurant1)')

  // Create VIEW_ONLY user (assigned to restaurant1 only)
  const viewerPasswordHash = await bcrypt.hash('Viewer@123', 10)
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      name: 'View Only User',
      email: 'viewer@example.com',
      passwordHash: viewerPasswordHash,
      status: 'ACTIVE',
      role: 'ADMIN',
    },
  })

  await prisma.userRestaurant.upsert({
    where: {
      userId_restaurantId: {
        userId: viewer.id,
        restaurantId: restaurant1.id,
      },
    },
    update: { role: RestaurantRole.VIEW_ONLY },
    create: {
      userId: viewer.id,
      restaurantId: restaurant1.id,
      role: RestaurantRole.VIEW_ONLY,
    },
  })

  console.log('Created VIEW_ONLY:', viewer.email, '(assigned to restaurant1)')

  // Create token sequences for restaurants
  await prisma.tokenSequence.upsert({
    where: { restaurantId: restaurant1.id },
    update: {},
    create: {
      restaurantId: restaurant1.id,
      currentValue: 0,
    },
  })

  await prisma.tokenSequence.upsert({
    where: { restaurantId: restaurant2.id },
    update: {},
    create: {
      restaurantId: restaurant2.id,
      currentValue: 0,
    },
  })

  // Create sample queue entries for restaurant1
  const restaurant1Entries = [
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

  for (const entry of restaurant1Entries) {
    const existing = await prisma.queueEntry.findFirst({
      where: {
        restaurantId: restaurant1.id,
        tokenNumber: entry.tokenNumber,
      },
    })

    if (!existing) {
      await prisma.queueEntry.create({
        data: {
          restaurantId: restaurant1.id,
          ...entry,
          status: 'WAITING',
        },
      })
    }
  }

  // Create sample queue entries for restaurant2
  const restaurant2Entries = [
    {
      name: 'Bob Johnson',
      mobileNumber: '+1234567892',
      partySize: 3,
      seatingType: 'Indoor' as const,
      tokenNumber: 'B001',
      positionSnapshot: 1,
    },
  ]

  for (const entry of restaurant2Entries) {
    const existing = await prisma.queueEntry.findFirst({
      where: {
        restaurantId: restaurant2.id,
        tokenNumber: entry.tokenNumber,
      },
    })

    if (!existing) {
      await prisma.queueEntry.create({
        data: {
          restaurantId: restaurant2.id,
          ...entry,
          status: 'WAITING',
        },
      })
    }
  }

  console.log('Created sample queue entries for both restaurants')

  console.log('\n=== Database seed completed! ===\n')
  console.log('Login credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('SUPER_ADMIN:')
  console.log('  Email: superadmin@example.com')
  console.log('  Password: SuperAdmin@123')
  console.log('  Access: Restaurant 1 (SUPER_ADMIN)')
  console.log('')
  console.log('RESTAURANT_ADMIN:')
  console.log('  Email: admin@example.com')
  console.log('  Password: Admin@123')
  console.log('  Access: Restaurant 1 & 2 (RESTAURANT_ADMIN)')
  console.log('')
  console.log('STAFF:')
  console.log('  Email: staff@example.com')
  console.log('  Password: Staff@123')
  console.log('  Access: Restaurant 1 (STAFF)')
  console.log('')
  console.log('VIEW_ONLY:')
  console.log('  Email: viewer@example.com')
  console.log('  Password: Viewer@123')
  console.log('  Access: Restaurant 1 (VIEW_ONLY)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\nRestaurant URLs:')
  console.log(`  Restaurant 1: http://localhost:3000/${restaurant1.slug}`)
  console.log(`  Restaurant 2: http://localhost:3000/${restaurant2.slug}`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

