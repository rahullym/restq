import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApiResponse } from '@/types'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        restaurantIds: session.user.restaurantIds,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}



