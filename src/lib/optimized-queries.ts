import { prisma } from './db-optimized'

export class OptimizedQueries {
  // Optimized dashboard stats with single query
  static async getDashboardStats(userId: string) {
    const [stats, friendStats, expenseStats, recentData] = await Promise.all([
      // User stats - faster query
      prisma.userStats.findUnique({
        where: { userId },
        select: {
          totalExpenses: true,
          totalOwed: true,
          totalOwing: true,
          friendsCount: true,
          expensesCount: true,
          transactionsCount: true,
          lastCalculated: true
        }
      }),
      
      // Friend balance aggregation
      prisma.friendship.aggregate({
        where: { userId },
        _sum: {
          balance: true
        },
        _count: {
          id: true
        }
      }),
      
      // Current month expenses
      prisma.expense.aggregate({
        where: {
          userId,
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      
      // Get recent items efficiently
      Promise.all([
        prisma.expense.findMany({
          where: { userId },
          select: {
            id: true,
            title: true,
            amount: true,
            category: true,
            date: true
          },
          orderBy: { date: 'desc' },
          take: 5
        }),
        
        prisma.transaction.findMany({
          where: { userId },
          select: {
            id: true,
            amount: true,
            type: true,
            description: true,
            date: true,
            friend: {
              select: { name: true, avatar: true }
            }
          },
          orderBy: { date: 'desc' },
          take: 5
        })
      ])
    ])

    return {
      stats: stats || {
        totalExpenses: expenseStats._sum.amount || 0,
        totalOwed: Math.max(0, friendStats._sum.balance || 0),
        totalOwing: Math.abs(Math.min(0, friendStats._sum.balance || 0)),
        friendsCount: friendStats._count || 0,
        expensesCount: expenseStats._count || 0,
        transactionsCount: 0
      },
      recentExpenses: recentData[0],
      recentTransactions: recentData[1]
    }
  }

  // Optimized friends list with balance
  static async getFriendsWithBalance(userId: string, limit = 20) {
    return prisma.friendship.findMany({
      where: { userId },
      select: {
        id: true,
        balance: true,
        lastTransactionAt: true,
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })
  }

  // Optimized chart data with minimal queries
  static async getChartData(userId: string) {
    const [categoryData, monthlyData, friendBalances] = await Promise.all([
      // Category breakdown
      prisma.expense.groupBy({
        by: ['category'],
        where: { userId },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      }),
      
      // Last 6 months data
      prisma.$queryRaw`
        SELECT 
          TO_CHAR(date, 'Mon') as month,
          SUM(amount) as expenses
        FROM expenses 
        WHERE "userId" = ${userId} 
          AND date >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(date, 'Mon'), DATE_TRUNC('month', date)
        ORDER BY DATE_TRUNC('month', date)
        LIMIT 6
      `,
      
      // Friend balances for chart
      prisma.friendship.findMany({
        where: { 
          userId,
          OR: [
            { balance: { gt: 0 } },
            { balance: { lt: 0 } }
          ]
        },
        select: {
          balance: true,
          friend: { select: { name: true } }
        },
        orderBy: { balance: 'desc' },
        take: 10
      })
    ])

    return {
      categoryData: categoryData.map(item => ({
        name: item.category,
        value: Number(item._sum.amount || 0),
        color: getCategoryColor(item.category)
      })),
      trendData: monthlyData,
      friendsData: friendBalances.map(item => ({
        name: item.friend.name,
        you: item.balance > 0 ? item.balance : 0,
        friend: item.balance < 0 ? -item.balance : 0
      }))
    }
  }
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Food': '#8B5CF6',
    'Travel': '#6366F1', 
    'Shopping': '#3B82F6',
    'Entertainment': '#8B5CF6',
    'Bills': '#6B7280',
    'Healthcare': '#EF4444',
    'Education': '#10B981',
    'Other': '#6B7280'
  }
  return colors[category] || '#6B7280'
}