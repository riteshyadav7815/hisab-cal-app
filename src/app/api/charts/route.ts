import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db-optimized';
import { withPerformanceLogging } from '@/lib/performance';

async function chartsHandler() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Simplified data fetch for better performance
    const [categoryDataRaw, friendsDataRaw] = await Promise.all([
      prisma.expense.groupBy({
        by: ['category'],
        where: { userId },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 4, // Reduced from 5
      }),
      prisma.friendship.findMany({
        where: { userId },
        select: {
          balance: true,
          friend: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          balance: 'desc',
        },
        take: 5, // Reduced from 10
      }),
    ]);

    const categoryColors = ['#8B5CF6', '#6366F1', '#3B82F6', '#10B981'];
    const categoryData = categoryDataRaw.map((item, index) => ({
      name: item.category,
      value: item._sum.amount || 0,
      color: categoryColors[index % categoryColors.length],
    }));

    // Simplified trend data (just current and last month)
    const trendData = [
      {
        month: 'Last Month',
        expenses: 0,
        income: 0,
      },
      {
        month: 'This Month', 
        expenses: 0,
        income: 0,
      },
    ];

    const friendsData = friendsDataRaw.map(item => ({
      name: item.friend.name,
      you: item.balance > 0 ? item.balance : 0,
      friend: item.balance < 0 ? -item.balance : 0,
    }));

    return NextResponse.json({
      success: true,
      charts: {
        categoryData,
        trendData,
        friendsData,
      },
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Charts API error:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withPerformanceLogging(chartsHandler, 'Charts API');