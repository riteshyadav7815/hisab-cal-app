import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db-optimized'

export async function GET(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Hyper-optimized query with essential fields only
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      select: {
        id: true,
        balance: true,
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 20, // Maximum performance with fewer records
    });

    // Minimal data transformation
    const friendsWithBalances = friendships.map((f) => ({
      id: f.friend.id,
      name: f.friend.name,
      email: f.friend.email,
      avatar: f.friend.name?.charAt(0)?.toUpperCase() || 'U',
      balance: f.balance,
      friendshipId: f.id,
    }));

    return NextResponse.json({
      success: true,
      data: friendsWithBalances,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=45, stale-while-revalidate=90',
      },
    })
  } catch (error) {
    console.error('Friendships API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}