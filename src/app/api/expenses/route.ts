import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withRateLimit } from '@/lib/rate-limit'
import { withPerformanceMonitoring } from '@/lib/performance-monitoring'
import { prisma } from '@/lib/db-optimized'

async function getExpensesHandler(req: NextRequest) {
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
    const { searchParams } = new URL(req.url)
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(10, parseInt(searchParams.get('limit') || '20'))) // Max 50, min 10
    const skip = (page - 1) * limit
    
    // Filter parameters
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')
    
    // Build where clause
    const whereClause: any = { userId }
    
    if (category && category !== 'all') {
      whereClause.category = category
    }
    
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) whereClause.date.gte = new Date(startDate)
      if (endDate) whereClause.date.lte = new Date(endDate)
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Parallel queries for better performance
    const [expenses, totalCount] = await Promise.all([
      prisma.expense.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          amount: true,
          category: true,
          date: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where: whereClause }),
    ])

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json(
      {
        success: true,
        expenses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Expenses GET API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createExpenseHandler(req: NextRequest) {
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
    
    const { title, amount, category, date, description } = body

    // Validation
    if (!title || !amount || !category) {
      return NextResponse.json(
        { error: 'Title, amount, and category are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        userId,
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : new Date(),
        description: description || null,
      },
    })

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Expense added successfully',
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Expenses POST API error:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withPerformanceMonitoring(getExpensesHandler, 'Expenses GET API')
export const POST = withPerformanceMonitoring(createExpenseHandler, 'Expenses POST API')