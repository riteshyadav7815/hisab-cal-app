import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceMonitoring } from '@/lib/performance-monitoring'
import { prisma } from '@/lib/db-optimized'

async function getTransactionsHandler(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResponse = await withRateLimit(req, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
    })
    if (rateLimitResponse) return rateLimitResponse

    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        friendship: {
          include: {
            friend: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to recent 20 transactions
    })

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      title: transaction.description || 'Transaction',
      amount: transaction.amount,
      date: transaction.date.toISOString().split('T')[0],
      friendName: transaction.friendship?.friend?.name || 'Unknown',
      type: transaction.type,
      status: 'SETTLED' // All transactions are considered settled for now
    }))

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Transactions GET API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createTransactionHandler(req: NextRequest) {
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
    const body = await req.json()
    
    const { friendId, amount, type, description } = body

    // Validation
    if (!friendId || !amount || !type) {
      return NextResponse.json(
        { error: 'Friend ID, amount, and type are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (!['GAVE', 'RECEIVED'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either GAVE or RECEIVED' },
        { status: 400 }
      )
    }

    // Check if friendship exists, create if it doesn't
    let friendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: userId,
          friendId: friendId,
        },
      },
    })

    if (!friendship) {
      // Create friendship if it doesn't exist
      friendship = await prisma.friendship.create({
        data: {
          userId: userId,
          friendId: friendId,
          balance: 0,
        },
      })
    }

    // Create transaction and update friendship balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          friendId,
          friendshipId: friendship.id,
          amount: parseFloat(amount),
          type,
          description: description || null,
          date: new Date(),
        },
        include: {
          friend: {
            select: {
              name: true,
            },
          },
        },
      })

      // Update friendship balance
      // If GAVE: increase balance (friend owes you more)
      // If RECEIVED: decrease balance (you owe friend less, or friend owes you less)
      const balanceChange = type === 'GAVE' ? parseFloat(amount) : -parseFloat(amount)
      
      const updatedFriendship = await tx.friendship.update({
        where: { id: friendship.id },
        data: {
          balance: {
            increment: balanceChange,
          },
          lastTransactionAt: new Date(),
        },
      })

      return { transaction, friendship: updatedFriendship }
    })

    return NextResponse.json({
      success: true,
      data: result.transaction,
      message: `Transaction completed successfully`,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Transactions POST API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withPerformanceMonitoring(getTransactionsHandler, 'Transactions GET API')
export const POST = withPerformanceMonitoring(createTransactionHandler, 'Transactions POST API')