/**
 * Restaurant Domain Entity
 */
export interface RestaurantProps {
  id: string
  name: string
  slug: string
  averageMinutesPerParty: number
  createdAt: Date
  updatedAt: Date
}

export class Restaurant {
  constructor(private props: RestaurantProps) {}

  get id() {
    return this.props.id
  }

  get name() {
    return this.props.name
  }

  get slug() {
    return this.props.slug
  }

  get averageMinutesPerParty() {
    return this.props.averageMinutesPerParty
  }

  set averageMinutesPerParty(value: number) {
    if (value < 1 || value > 60) {
      throw new Error('Average minutes per party must be between 1 and 60')
    }
    this.props.averageMinutesPerParty = value
    this.props.updatedAt = new Date()
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  toJSON() {
    return { ...this.props }
  }
}



