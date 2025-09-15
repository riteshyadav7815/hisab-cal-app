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

    // Ultra-optimized query with absolute minimal data selection
    const friendships = await prisma.friendship.findMany({
      where: { userId: session.user.id },
      select: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      take: 20, // Reduced for maximum performance
    });

    // Ultra-lightweight transformation
    const friends = friendships.map((f) => f.friend);

    return NextResponse.json({
      success: true,
      data: friends,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=45, stale-while-revalidate=90',
      },
    });
  } catch (error) {
    console.error('Friends API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    });

    if (!user) {
      // Create user if doesn't exist
      await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.name,
          image: session.user.image,
        }
      });
    }

    const body = await req.json()
    const { name, email, phone, avatar } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create friend
    const friend = await prisma.friend.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        avatar: avatar || null,
      },
    })

    // Create friendship
    const friendship = await prisma.friendship.create({
      data: {
        userId: session.user.id,
        friendId: friend.id,
        balance: 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        friend,
        friendship,
      },
    })
  } catch (error) {
    console.error('Create friend error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}