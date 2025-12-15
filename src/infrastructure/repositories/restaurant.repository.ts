/**
 * Restaurant Repository Interface
 */
import { Restaurant } from '@/domain/entities/restaurant'
import { Result } from '@/shared/types/result'

export interface IRestaurantRepository {
  findById(id: string): Promise<Restaurant | null>
  findBySlug(slug: string): Promise<Restaurant | null>
  create(restaurant: Restaurant): Promise<Result<Restaurant>>
  update(restaurant: Restaurant): Promise<Result<Restaurant>>
  delete(id: string): Promise<Result<void>>
}
