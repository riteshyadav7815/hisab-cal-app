import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceLogging } from '@/lib/performance'
import { prisma } from '@/lib/db-optimized'

async function getStatsHandler(req: NextRequest) {
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

    // Single optimized query to get all data at once
    const [transactions, friendships, expenses, expenseStats] = await Promise.all([
      // Get transactions with minimal data
      prisma.transaction.findMany({
        where: { userId },
        select: {
          amount: true,
          type: true,
          createdAt: true,
        },
      }),
      // Get friendships with minimal data
      prisma.friendship.findMany({
        where: { userId },
        select: {
          balance: true,
        },
      }),
      // Get expenses with minimal data
      prisma.expense.findMany({
        where: { userId },
        select: {
          amount: true,
          category: true,
          createdAt: true,
        },
      }),
      // Get expense category aggregation in one query
      prisma.expense.groupBy({
        by: ['category'],
        where: { userId },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
        take: 1,
      })
    ])

    // Calculate statistics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalTransactions = transactions.reduce((sum, t) => {
      return sum + (t.type === 'GAVE' ? t.amount : 0)
    }, 0)
    const totalSpent = totalExpenses + totalTransactions

    const totalOwed = friendships.reduce((sum, f) => {
      return sum + (f.balance > 0 ? f.balance : 0)
    }, 0)

    const totalOwing = friendships.reduce((sum, f) => {
      return sum + (f.balance < 0 ? Math.abs(f.balance) : 0)
    }, 0)

    const pendingSettlements = totalOwed + totalOwing

    // Calculate biggest expense category from aggregated data
    let biggestCategory = 'General'
    let biggestCategoryAmount = 0
    
    if (expenseStats.length > 0 && expenseStats[0]._sum.amount) {
      biggestCategory = expenseStats[0].category || 'General'
      biggestCategoryAmount = expenseStats[0]._sum.amount
    }

    // Calculate monthly change (comparing current month to previous month)
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const currentMonthTransactionExpenses = transactions
      .filter(t => t.createdAt >= currentMonthStart && t.type === 'GAVE')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const currentMonthDirectExpenses = expenses
      .filter(e => e.createdAt >= currentMonthStart)
      .reduce((sum, e) => sum + e.amount, 0)
    
    const currentMonthExpenses = currentMonthTransactionExpenses + currentMonthDirectExpenses

    const previousMonthTransactionExpenses = transactions
      .filter(t => 
        t.createdAt >= previousMonthStart && 
        t.createdAt < currentMonthStart && 
        t.type === 'GAVE'
      )
      .reduce((sum, t) => sum + t.amount, 0)
    
    const previousMonthDirectExpenses = expenses
      .filter(e => 
        e.createdAt >= previousMonthStart && 
        e.createdAt < currentMonthStart
      )
      .reduce((sum, e) => sum + e.amount, 0)
    
    const previousMonthExpenses = previousMonthTransactionExpenses + previousMonthDirectExpenses

    const monthlyChange = previousMonthExpenses > 0 
      ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
      : 0

    const stats = {
      totalExpenses: totalSpent,
      totalOwed,
      totalOwing,
      friendsCount: friendships.length,
      expensesCount: transactions.length + expenses.length,
      pendingSettlements,
      biggestCategory,
      biggestCategoryAmount,
      monthlyChange,
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stats API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withPerformanceLogging(getStatsHandler, 'Stats GET API');