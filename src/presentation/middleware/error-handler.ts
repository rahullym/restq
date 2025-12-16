/**
 * Error Handler Middleware
 * Centralized error handling for API routes
 */
import { NextResponse } from 'next/server'
import { ApiResponse } from '@/shared/types/api'
import { logError } from '@/lib/logger'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown, context?: Record<string, unknown>) {
  // Log error
  logError('api.error', error instanceof Error ? error : new Error(String(error)), context)

  // Handle known errors
  if (error instanceof AppError) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message,
      },
      { status: error.statusCode }
    )
  }

  // Handle validation errors (Zod)
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    const zodError = error as { errors?: Array<{ message?: string }> }
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: zodError.errors?.[0]?.message || 'Validation error',
      },
      { status: 400 }
    )
  }

  // Handle unknown errors
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: 'Internal server error',
    },
    { status: 500 }
  )
}
