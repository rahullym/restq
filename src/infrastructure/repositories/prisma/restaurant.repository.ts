/**
 * Prisma implementation of Restaurant Repository
 */
import { PrismaClient } from '@prisma/client'
import { Restaurant } from '@/domain/entities/restaurant'
import { IRestaurantRepository } from '../restaurant.repository'
import { Result } from '@/shared/types/result'

export class PrismaRestaurantRepository implements IRestaurantRepository {
  constructor(private prisma: PrismaClient) {}

  private toDomain(prismaRestaurant: any): Restaurant {
    return new Restaurant({
      id: prismaRestaurant.id,
      name: prismaRestaurant.name,
      slug: prismaRestaurant.slug,
      averageMinutesPerParty: prismaRestaurant.averageMinutesPerParty,
      createdAt: prismaRestaurant.createdAt,
      updatedAt: prismaRestaurant.updatedAt,
    })
  }

  async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
    })
    return restaurant ? this.toDomain(restaurant) : null
  }

  async findBySlug(slug: string): Promise<Restaurant | null> {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { slug },
    })
    return restaurant ? this.toDomain(restaurant) : null
  }

  async create(restaurant: Restaurant): Promise<Result<Restaurant>> {
    try {
      const created = await this.prisma.restaurant.create({
        data: {
          name: restaurant.name,
          slug: restaurant.slug,
          averageMinutesPerParty: restaurant.averageMinutesPerParty,
        },
      })
      return Result.ok(this.toDomain(created))
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async update(restaurant: Restaurant): Promise<Result<Restaurant>> {
    try {
      const updated = await this.prisma.restaurant.update({
        where: { id: restaurant.id },
        data: {
          averageMinutesPerParty: restaurant.averageMinutesPerParty,
        },
      })
      return Result.ok(this.toDomain(updated))
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.prisma.restaurant.delete({ where: { id } })
      return Result.ok(undefined)
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
