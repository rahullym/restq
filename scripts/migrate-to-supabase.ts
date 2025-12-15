#!/usr/bin/env tsx
/**
 * Migration script to migrate data from current database to Supabase
 * 
 * Usage:
 *   1. Set OLD_DATABASE_URL in .env (your current database)
 *   2. Set DATABASE_URL in .env (your Supabase database)
 *   3. Run: npm run migrate:to-supabase
 */

import { PrismaClient } from '@prisma/client'

const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.OLD_DATABASE_URL,
    },
  },
})

const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function migrate() {
  console.log('🚀 Starting database migration to Supabase...\n')

  const hasOldDatabase = !!process.env.OLD_DATABASE_URL

  if (!hasOldDatabase) {
    console.log('ℹ️  OLD_DATABASE_URL not set - assuming fresh setup')
    console.log('   This script will only verify Supabase connection\n')
  }

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('supabase')) {
    console.error('❌ DATABASE_URL not set or not pointing to Supabase')
    console.log('Update DATABASE_URL in your .env file with your Supabase connection string')
    process.exit(1)
  }

  try {
    // Test connections
    console.log('📡 Testing database connections...')
    
    if (hasOldDatabase) {
      await oldPrisma.$connect()
      console.log('✅ Connected to old database')
    }
    
    await newPrisma.$connect()
    console.log('✅ Connected to Supabase database\n')

    if (!hasOldDatabase) {
      console.log('✅ Supabase connection verified!')
      console.log('   Run "npm run db:push" to create schema')
      console.log('   Run "npm run db:seed" to seed initial data\n')
      return
    }

    // Migrate Restaurants
    console.log('📦 Migrating Restaurants...')
    const restaurants = await oldPrisma.restaurant.findMany()
    console.log(`   Found ${restaurants.length} restaurants`)
    
    for (const restaurant of restaurants) {
      await newPrisma.restaurant.upsert({
        where: { id: restaurant.id },
        update: {
          name: restaurant.name,
          slug: restaurant.slug,
          averageMinutesPerParty: restaurant.averageMinutesPerParty,
          updatedAt: restaurant.updatedAt,
        },
        create: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          averageMinutesPerParty: restaurant.averageMinutesPerParty,
          createdAt: restaurant.createdAt,
          updatedAt: restaurant.updatedAt,
        },
      })
    }
    console.log(`✅ Migrated ${restaurants.length} restaurants\n`)

    // Migrate Users
    console.log('👥 Migrating Users...')
    const users = await oldPrisma.user.findMany()
    console.log(`   Found ${users.length} users`)
    
    for (const user of users) {
      await newPrisma.user.upsert({
        where: { id: user.id },
        update: {
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          updatedAt: user.updatedAt,
        },
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    }
    console.log(`✅ Migrated ${users.length} users\n`)

    // Migrate UserRestaurant relationships
    console.log('🔗 Migrating User-Restaurant relationships...')
    const userRestaurants = await oldPrisma.userRestaurant.findMany()
    console.log(`   Found ${userRestaurants.length} relationships`)
    
    for (const ur of userRestaurants) {
      await newPrisma.userRestaurant.upsert({
        where: {
          userId_restaurantId: {
            userId: ur.userId,
            restaurantId: ur.restaurantId,
          },
        },
        update: {},
        create: {
          id: ur.id,
          userId: ur.userId,
          restaurantId: ur.restaurantId,
          createdAt: ur.createdAt,
        },
      })
    }
    console.log(`✅ Migrated ${userRestaurants.length} relationships\n`)

    // Migrate QueueEntries
    console.log('📋 Migrating Queue Entries...')
    const queueEntries = await oldPrisma.queueEntry.findMany()
    console.log(`   Found ${queueEntries.length} queue entries`)
    
    for (const entry of queueEntries) {
      await newPrisma.queueEntry.upsert({
        where: { id: entry.id },
        update: {
          name: entry.name,
          mobileNumber: entry.mobileNumber,
          partySize: entry.partySize,
          seatingType: entry.seatingType,
          status: entry.status,
          tokenNumber: entry.tokenNumber,
          positionSnapshot: entry.positionSnapshot,
          updatedAt: entry.updatedAt,
        },
        create: {
          id: entry.id,
          restaurantId: entry.restaurantId,
          name: entry.name,
          mobileNumber: entry.mobileNumber,
          partySize: entry.partySize,
          seatingType: entry.seatingType,
          status: entry.status,
          tokenNumber: entry.tokenNumber,
          positionSnapshot: entry.positionSnapshot,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
      })
    }
    console.log(`✅ Migrated ${queueEntries.length} queue entries\n`)

    // Verify migration
    console.log('🔍 Verifying migration...')
    const newRestaurantCount = await newPrisma.restaurant.count()
    const newUserCount = await newPrisma.user.count()
    const newQueueEntryCount = await newPrisma.queueEntry.count()
    
    console.log(`\n📊 Migration Summary:`)
    console.log(`   Restaurants: ${restaurants.length} → ${newRestaurantCount}`)
    console.log(`   Users: ${users.length} → ${newUserCount}`)
    console.log(`   Queue Entries: ${queueEntries.length} → ${newQueueEntryCount}`)
    
    if (
      restaurants.length === newRestaurantCount &&
      users.length === newUserCount &&
      queueEntries.length === newQueueEntryCount
    ) {
      console.log('\n✅ Migration completed successfully!')
    } else {
      console.log('\n⚠️  Warning: Counts do not match. Please verify manually.')
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

migrate()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
