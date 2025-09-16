import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceMonitoring } from '@/lib/performance-monitoring'
import { prisma } from '@/lib/db-optimized'

async function getRecentTransactionsHandler(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(req, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 50,
    })
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get recent transactions (last 10)
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      },
      include: {
        user: {
          select: { name: true }
        },
        friend: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Format the transactions for the frontend
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
      friendName: transaction.userId === userId 
        ? (transaction.friend?.name || 'Unknown Friend') 
        : (transaction.user?.name || 'You')
    }))

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Recent transactions API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withPerformanceMonitoring(getRecentTransactionsHandler, 'Recent Transactions GET API')