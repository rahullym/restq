/**
 * Wait Time Calculator Domain Service
 * Pure business logic for calculating wait times
 */
export interface WaitTimeResult {
  minutes: number
  friendly: string
}

export class WaitTimeCalculator {
  /**
   * Calculate estimated wait time based on position and average minutes per party
   */
  static calculate(
    positionAhead: number,
    averageMinutesPerParty: number
  ): WaitTimeResult {
    const totalMinutes = positionAhead * averageMinutesPerParty

    if (totalMinutes <= 0) {
      return { minutes: 0, friendly: 'Ready now' }
    }

    if (totalMinutes <= 5) {
      return { minutes: totalMinutes, friendly: 'about 5 minutes' }
    }

    if (totalMinutes <= 10) {
      return { minutes: totalMinutes, friendly: 'about 10 minutes' }
    }

    // Round to nearest 5 minutes for ranges
    const rounded = Math.round(totalMinutes / 5) * 5
    const lower = Math.max(5, rounded - 5)
    const upper = rounded + 5

    if (lower === upper - 5) {
      return { minutes: totalMinutes, friendly: `about ${lower} minutes` }
    }

    return { minutes: totalMinutes, friendly: `about ${lower}-${upper} minutes` }
  }
}



