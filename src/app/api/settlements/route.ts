import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceMonitoring } from '@/lib/performance-monitoring'
import { prisma } from '@/lib/db-optimized'

async function createSettlementHandler(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(req, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 20,
    })
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { friendId } = await req.json()

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      )
    }

    // Get the friendship and current balance
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      },
      include: {
        friend: {
          select: { name: true }
        }
      }
    })

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      )
    }

    if (friendship.balance === 0) {
      return NextResponse.json(
        { error: 'No balance to settle' },
        { status: 400 }
      )
    }

    // Create settlement transaction
    const settlementAmount = Math.abs(friendship.balance)
    const settlementType = friendship.balance > 0 ? 'RECEIVED' : 'GAVE'
    
    await prisma.$transaction(async (tx) => {
      // Create settlement transaction record
      await tx.transaction.create({
        data: {
          userId,
          friendId,
          friendshipId: friendship.id,
          amount: settlementAmount,
          type: settlementType,
          description: `Settlement with ${friendship.friend.name}`
        }
      })

      // Reset friendship balance to 0
      await tx.friendship.update({
        where: { id: friendship.id },
        data: { 
          balance: 0,
          lastTransactionAt: new Date()
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `Successfully settled ₹${settlementAmount.toLocaleString()} with ${friendship.friend.name}`,
      data: {
        amount: settlementAmount,
        friendName: friendship.friend.name,
        type: settlementType
      }
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Settlement API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withPerformanceMonitoring(createSettlementHandler, 'Settlements POST API');