import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole, RestaurantRole, UserStatus } from '@prisma/client'
import { checkRateLimit } from './rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Rate limit login attempts: 5 attempts per 15 minutes per email
        const rateLimitResult = await checkRateLimit({
          identifier: credentials.email,
          type: 'mobile', // Reuse mobile type for email rate limiting
          maxRequests: 5,
          windowMinutes: 15,
        })

        if (!rateLimitResult.allowed) {
          console.warn(`Login rate limit exceeded for: ${credentials.email}`)
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            restaurants: {
              include: {
                restaurant: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    status: true,
                  },
                },
              },
            },
          },
        })

        if (!user) {
          return null
        }

        // Check if user is active
        if (user.status !== 'ACTIVE') {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Build restaurant mappings with roles, only including active restaurants
        const restaurantMappings = user.restaurants
          .filter((ur) => ur.restaurant.status === 'ACTIVE')
          .map((ur) => ({
            restaurantId: ur.restaurantId,
            role: ur.role,
            restaurantName: ur.restaurant.name,
            restaurantSlug: ur.restaurant.slug,
          }))

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          restaurantMappings,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // Type assertion needed because NextAuth User type doesn't include restaurantMappings
        // but we add it in the authorize function return value
        token.restaurantMappings =
          ('restaurantMappings' in user ? user.restaurantMappings : []) as Array<{
            restaurantId: string
            role: RestaurantRole
            restaurantName: string
            restaurantSlug: string
          }>
      }
      
      // Handle selected restaurant updates from session.update() call
      if (trigger === 'update' && session) {
        if ('selectedRestaurantId' in session) {
          token.selectedRestaurantId = session.selectedRestaurantId as string
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.restaurantMappings = (token.restaurantMappings as Array<{
          restaurantId: string
          role: RestaurantRole
          restaurantName: string
          restaurantSlug: string
        }>) || []
        session.selectedRestaurantId = (token.selectedRestaurantId as string) || undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/api/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      restaurantMappings: Array<{
        restaurantId: string
        role: RestaurantRole
        restaurantName: string
        restaurantSlug: string
      }>
    }
    selectedRestaurantId?: string
  }

  interface User {
    id: string
    name: string
    email: string
    restaurantMappings: Array<{
      restaurantId: string
      role: RestaurantRole
      restaurantName: string
      restaurantSlug: string
    }>
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    restaurantMappings: Array<{
      restaurantId: string
      role: RestaurantRole
      restaurantName: string
      restaurantSlug: string
    }>
    selectedRestaurantId?: string
  }
}


