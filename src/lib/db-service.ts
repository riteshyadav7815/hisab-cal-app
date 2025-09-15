import { prisma } from './db-optimized';
import { cache } from './cache';
import type { Prisma, Friendship, Expense, Transaction, UserStats, User } from '@prisma/client';

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Define a type for the enriched Friendship object that includes the friend relation
type FriendshipWithFriend = Friendship & {
  friend: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export class DatabaseService {
  // User operations
  static async getUserById(userId: string): Promise<User | null> {
    const cacheKey = `user:${userId}`;
    const cached: User | null = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        _count: {
          select: {
            expenses: true,
            transactions: true,
            friendships: true,
          },
        },
      },
    });

    if (user) {
      await cache.set(cacheKey, user, { ttl: 300 }); // 5 minutes
    }

    return user;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const cacheKey = `user:email:${email}`;
    const cached: User | null = await cache.get(cacheKey);
    if (cached) return cached;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
      },
    });

    if (user) {
      await cache.set(cacheKey, user, { ttl: 300 });
    }

    return user;
  }

  // Friends operations
  static async getFriends(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<FriendshipWithFriend>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const cacheKey = `friends:${userId}:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cached: PaginatedResult<FriendshipWithFriend> | null = await cache.get(cacheKey);
    if (cached) return cached;

    const [friends, total] = await Promise.all([
      prisma.friendship.findMany({
        where: { userId },
        include: {
          friend: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.friendship.count({
        where: { userId },
      }),
    ]);

    const result: PaginatedResult<FriendshipWithFriend> = {
      data: friends as FriendshipWithFriend[], // Cast here to satisfy TypeScript
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    await cache.set(cacheKey, result, { ttl: 60 }); // 1 minute
    return result;
  }

  // Expenses operations
  static async getExpenses(userId: string, options: PaginationOptions & {
    category?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
  } = {}): Promise<PaginatedResult<Expense>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'date', 
      sortOrder = 'desc',
      category,
      startDate,
      endDate,
      search
    } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = { userId };
    
    if (category) where.category = category;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const cacheKey = `expenses:${userId}:${JSON.stringify(where)}:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cached: PaginatedResult<Expense> | null = await cache.get(cacheKey);
    if (cached) return cached;

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    const result: PaginatedResult<Expense> = {
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    await cache.set(cacheKey, result, { ttl: 60 });
    return result;
  }

  // Transactions operations
  static async getTransactions(userId: string, options: PaginationOptions & {
    friendId?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}): Promise<PaginatedResult<Transaction>> {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'date', 
      sortOrder = 'desc',
      friendId,
      type,
      startDate,
      endDate
    } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = { userId };
    
    if (friendId) where.friendId = friendId;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const cacheKey = `transactions:${userId}:${JSON.stringify(where)}:${page}:${limit}:${sortBy}:${sortOrder}`;
    const cached: PaginatedResult<Transaction> | null = await cache.get(cacheKey);
    if (cached) return cached;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          friend: true,
          friendship: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    const result: PaginatedResult<Transaction> = {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };

    await cache.set(cacheKey, result, { ttl: 60 });
    return result;
  }

  // Statistics operations
  static async getUserStats(userId: string): Promise<UserStats | null> {
    const cacheKey = `stats:${userId}`;
    const cached: UserStats | null = await cache.get(cacheKey);
    if (cached) return cached;

    const stats = await prisma.userStats.findUnique({
      where: { userId },
    });

    if (stats) {
      await cache.set(cacheKey, stats, { ttl: 300 });
    }

    return stats;
  }

  // Update user statistics
  static async updateUserStats(userId: string): Promise<UserStats> {
    const [
      totalExpenses,
      totalOwed,
      totalOwing,
      friendsCount,
      expensesCount,
      transactionsCount,
    ] = await Promise.all([
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.friendship.aggregate({
        where: { 
          userId,
          balance: { gt: 0 },
        },
        _sum: { balance: true },
      }),
      prisma.friendship.aggregate({
        where: { 
          userId,
          balance: { lt: 0 },
        },
        _sum: { balance: true },
      }),
      prisma.friendship.count({
        where: { userId },
      }),
      prisma.expense.count({
        where: { userId },
      }),
      prisma.transaction.count({
        where: { userId },
      }),
    ]);

    // Ensure user exists before creating/updating stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      console.error(`User ${userId} not found, cannot update stats`);
      throw new Error('User not found');
    }

    const stats = await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalExpenses: totalExpenses._sum.amount || 0,
        totalOwed: totalOwed._sum.balance || 0,
        totalOwing: Math.abs(totalOwing._sum.balance || 0),
        friendsCount,
        expensesCount,
        transactionsCount,
        lastCalculated: new Date(),
      },
      create: {
        userId,
        totalExpenses: totalExpenses._sum.amount || 0,
        totalOwed: totalOwed._sum.balance || 0,
        totalOwing: Math.abs(totalOwing._sum.balance || 0),
        friendsCount,
        expensesCount,
        transactionsCount,
      },
    });

    // Clear related cache
    await cache.delete(`stats:${userId}`);
    await cache.delete(`user:${userId}`);

    return stats;
  }

  // Clear user cache
  static async clearUserCache(userId: string) {
    const patterns = [
      `user:${userId}`,
      `user:email:*`,
      `friends:${userId}:*`,
      `expenses:${userId}:*`,
      `transactions:${userId}:*`,
      `stats:${userId}`,
    ];

    for (const pattern of patterns) {
      await cache.delete(pattern);
    }
  }
}

export default DatabaseService;
