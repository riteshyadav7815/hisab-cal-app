import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceLogging } from '@/lib/performance'
import { prisma } from '@/lib/db-optimized'

// Helper function to get category icon
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'Food': '🍕',
    'Travel': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Health': '💊',
    'Bills': '📱',
    'Education': '📚',
    'Other': '💰',
  }
  return iconMap[category] || '💰'
}

async function getDashboardHandler(req: NextRequest) {
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

    // Single optimized query to get all dashboard data
    const [
      transactionStats,
      friendshipStats,
      expenseStats,
      recentTransactions,
      recentExpenses,
      topCategory
    ] = await Promise.all([
      // Transaction aggregations
      prisma.transaction.aggregate({
        where: { userId },
        _sum: { amount: true },
        _count: true,
      }),
      // Friendship aggregations
      prisma.friendship.aggregate({
        where: { userId },
        _sum: { balance: true },
        _count: true,
      }),
      // Expense aggregations
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
        _count: true,
      }),
      // Recent transactions
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          createdAt: true,
          friend: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Recent expenses
      prisma.expense.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          category: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Top expense category
      prisma.expense.groupBy({
        by: ['category'],
        where: { userId },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1,
      })
    ])

    // Calculate balances
    const totalOwed = await prisma.friendship.aggregate({
      where: { userId, balance: { gt: 0 } },
      _sum: { balance: true },
    })

    const totalOwing = await prisma.friendship.aggregate({
      where: { userId, balance: { lt: 0 } },
      _sum: { balance: true },
    })

    // Process stats
    const totalExpenses = (expenseStats._sum.amount || 0) + (transactionStats._sum.amount || 0)
    const netBalance = (totalOwed._sum.balance || 0) + (totalOwing._sum.balance || 0)
    const pendingSettlements = Math.abs(totalOwed._sum.balance || 0) + Math.abs(totalOwing._sum.balance || 0)

    // Process activities
    const transactionActivities = recentTransactions.map(transaction => ({
      id: `transaction-${transaction.id}`,
      type: transaction.type === 'GAVE' ? 'gave' : 'received',
      amount: transaction.amount,
      friend: transaction.friend.name,
      date: transaction.createdAt.toISOString(),
      icon: transaction.type === 'GAVE' ? '💸' : '💰',
      description: transaction.description || `${transaction.type === 'GAVE' ? 'Paid' : 'Received'} ${transaction.friend.name}`,
    }))

    const expenseActivities = recentExpenses.map(expense => ({
      id: `expense-${expense.id}`,
      type: 'spent' as const,
      amount: expense.amount,
      category: expense.category,
      date: expense.createdAt.toISOString(),
      icon: getCategoryIcon(expense.category),
      description: expense.title,
    }))

    const allActivities = [...transactionActivities, ...expenseActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    const stats = {
      totalExpenses,
      totalOwed: totalOwed._sum.balance || 0,
      totalOwing: Math.abs(totalOwing._sum.balance || 0),
      friendsCount: friendshipStats._count,
      expensesCount: transactionStats._count + expenseStats._count,
      pendingSettlements,
      biggestCategory: topCategory[0]?.category || 'General',
      biggestCategoryAmount: topCategory[0]?._sum.amount || 0,
      monthlyChange: 0, // Simplified for performance
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        activities: allActivities,
        timestamp: new Date().toISOString(),
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Dashboard API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withPerformanceLogging(getDashboardHandler, 'Dashboard GET API');