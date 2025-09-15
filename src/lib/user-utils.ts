import { prisma } from '@/lib/db-optimized';

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export async function ensureUserExists(sessionUser: SessionUser): Promise<void> {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { id: true }
    });

    if (!existingUser) {
      // Create user if doesn't exist
      await prisma.user.create({
        data: {
          id: sessionUser.id,
          email: sessionUser.email || '',
          name: sessionUser.name,
          image: sessionUser.image,
        }
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Created new user: ${sessionUser.id}`);
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error ensuring user exists:', error);
    }
    throw error;
  }
}

export async function getUserWithValidation(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isActive: true,
    }
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  if (!user.isActive) {
    throw new Error(`User ${userId} is not active`);
  }

  return user;
}