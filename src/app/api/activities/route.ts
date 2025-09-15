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

async function getActivitiesHandler(req: NextRequest) {
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

    // Get recent transactions and expenses with minimal data
    const [transactions, expenses] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          type: true,
          description: true,
          createdAt: true,
          friend: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
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
        take: 10,
      })
    ])

    // Transform transactions to activities
    const transactionActivities = transactions.map(transaction => ({
      id: `transaction-${transaction.id}`,
      type: transaction.type === 'GAVE' ? 'gave' : 'received',
      amount: transaction.amount,
      friend: transaction.friend.name,
      date: transaction.createdAt.toISOString(),
      icon: transaction.type === 'GAVE' ? '💸' : '💰',
      description: transaction.description || `${transaction.type === 'GAVE' ? 'Paid' : 'Received'} ${transaction.friend.name}`,
    }))

    // Transform expenses to activities
    const expenseActivities = expenses.map(expense => ({
      id: `expense-${expense.id}`,
      type: 'spent' as const,
      amount: expense.amount,
      category: expense.category,
      date: expense.createdAt.toISOString(),
      icon: getCategoryIcon(expense.category),
      description: expense.title,
    }))

    // Combine and sort all activities by date
    const allActivities = [...transactionActivities, ...expenseActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      activities: allActivities,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Activities API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withPerformanceLogging(getActivitiesHandler, 'Activities GET API');