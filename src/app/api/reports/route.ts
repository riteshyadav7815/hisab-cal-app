import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceMonitoring } from '@/lib/performance-monitoring'
import { prisma } from '@/lib/db-optimized'

async function getReportsHandler(req: NextRequest) {
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
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'monthly'
    
    // Safely parse dates with fallbacks
    let startDate: Date, endDate: Date;
    try {
      startDate = searchParams.get('start') ? new Date(searchParams.get('start')!) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      endDate = searchParams.get('end') ? new Date(searchParams.get('end')!) : new Date()
    } catch (dateError) {
      console.error('Date parsing error:', dateError)
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      endDate = new Date()
    }

    // Current month dates for monthly stats
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthEnd = new Date()
    const daysInMonth = monthEnd.getDate()

    // Consolidated parallel queries for maximum performance
    const [
      categoryBreakdown,
      topSpends,
      friendReports,
      monthlyExpenses,
      recentTrends
    ] = await Promise.all([
      // Category breakdown with limit for performance
      prisma.expense.groupBy({
        by: ['category'],
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 8, // Limit to top 8 categories
      }),
      
      // Top spends - optimized query
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        select: {
          title: true,
          amount: true,
          date: true,
          category: true,
        },
        orderBy: { amount: 'desc' },
        take: 5,
      }),
      
      // Friend reports - select only necessary fields
      prisma.friendship.findMany({
        where: { userId },
        select: {
          balance: true,
          friend: {
            select: { name: true },
          },
        },
        orderBy: { balance: 'desc' },
        take: 10, // Limit friends for performance
      }),
      
      // Monthly stats - single aggregation
      prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        _max: { amount: true },
        _count: { id: true },
      }),
      
      // Simplified trends - last 3 months only for better performance
      prisma.expense.groupBy({
        by: ['date'],
        where: {
          userId,
          date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 3 months
        },
        _sum: { amount: true },
        orderBy: { date: 'desc' },
        take: 90, // Daily data for 3 months max
      })
    ])

    // Process category data efficiently
    const totalExpenses = categoryBreakdown.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0)
    const categoryData = categoryBreakdown.map((cat, index) => ({
      name: cat.category,
      value: totalExpenses > 0 ? Math.round(((cat._sum.amount || 0) / totalExpenses) * 100) : 0,
      amount: cat._sum.amount || 0,
      color: getCategoryColor(cat.category, index),
    }))

    // Process trends data (group by month from daily data)
    const monthlyTrendsMap = new Map<string, number>()
    recentTrends.forEach(trend => {
      try {
        const monthKey = trend.date.toISOString().substring(0, 7) // YYYY-MM format
        const currentAmount = monthlyTrendsMap.get(monthKey) || 0
        monthlyTrendsMap.set(monthKey, currentAmount + (trend._sum.amount || 0))
      } catch (trendError) {
        console.error('Error processing trend data:', trendError)
      }
    })
    
    const expenseTrends = Array.from(monthlyTrendsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-3) // Last 3 months
      .map(([monthKey, expenses]) => ({
        month: new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'short' }),
        expenses,
        budget: 15000,
      }))

    // Process friend data efficiently
    const friendData = friendReports.map(friendship => ({
      name: friendship.friend.name || 'Unknown',
      youOwe: friendship.balance < 0 ? Math.abs(friendship.balance) : 0,
      owesYou: friendship.balance > 0 ? friendship.balance : 0,
      netBalance: friendship.balance,
    }))

    // Monthly stats calculation
    const monthlyStats = {
      totalSpent: monthlyExpenses._sum.amount || 0,
      dailyAverage: daysInMonth > 0 ? Math.round((monthlyExpenses._sum.amount || 0) / daysInMonth) : 0,
      biggestSpend: monthlyExpenses._max.amount || 0,
      savingsVsTarget: Math.min(Math.max(Math.round(((15000 - (monthlyExpenses._sum.amount || 0)) / 15000) * 100), 0), 100),
    }

    const reports = {
      categoryBreakdown: categoryData,
      expenseTrends,
      topSpends: topSpends.map(expense => ({
        title: expense.title,
        amount: expense.amount,
        date: expense.date.toISOString().split('T')[0],
        category: expense.category,
      })),
      friendReports: friendData,
      monthlyStats,
    }

    return NextResponse.json(
      { success: true, reports },
      { 
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        }
      }
    )
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function getCategoryColor(category: string, index: number): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ]
  const categoryColors: { [key: string]: string } = {
    'Food': '#FF6B6B',
    'Travel': '#4ECDC4', 
    'Shopping': '#45B7D1',
    'Entertainment': '#96CEB4',
    'Bills': '#FFEAA7',
    'Healthcare': '#DDA0DD',
    'Education': '#98D8C8',
    'Other': '#F7DC6F'
  }
  return categoryColors[category] || colors[index % colors.length]
}

export const GET = withPerformanceMonitoring(getReportsHandler, 'Reports GET API');