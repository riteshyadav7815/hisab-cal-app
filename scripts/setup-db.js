#!/usr/bin/env node

/**
 * Database Setup Script for Hisab Calculator
 * This script helps initialize the database with sample data
 */

const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up Hisab Calculator database...');

  try {
    // Create sample user
    const user = await prisma.user.upsert({
      where: { email: 'demo@hisab.com' },
      update: {},
      create: {
        email: 'demo@hisab.com',
        name: 'Demo User',
        username: 'demo_user',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJapJj3qJ7I9K7lJ7lJ', // password: demo123
      },
    });

    console.log('✅ Created demo user:', user.email);

    // Create sample friends
    const friends = await Promise.all([
      prisma.friend.create({
        data: {
          name: 'Aman',
          email: 'aman@example.com',
          phone: '+91 98765 43210',
          avatar: '👨‍💼',
        },
      }),
      prisma.friend.create({
        data: {
          name: 'Ravi',
          email: 'ravi@example.com',
          phone: '+91 98765 43211',
          avatar: '👨‍🎓',
        },
      }),
      prisma.friend.create({
        data: {
          name: 'Priya',
          email: 'priya@example.com',
          phone: '+91 98765 43212',
          avatar: '👩‍💻',
        },
      }),
    ]);

    console.log('✅ Created sample friends:', friends.length);

    // Create friendships
    const friendships = await Promise.all([
      prisma.friendship.create({
        data: {
          userId: user.id,
          friendId: friends[0].id,
          balance: 300, // Aman owes user ₹300
        },
      }),
      prisma.friendship.create({
        data: {
          userId: user.id,
          friendId: friends[1].id,
          balance: -100, // User owes Ravi ₹100
        },
      }),
      prisma.friendship.create({
        data: {
          userId: user.id,
          friendId: friends[2].id,
          balance: 500, // Priya owes user ₹500
        },
      }),
    ]);

    console.log('✅ Created friendships:', friendships.length);

    // Create sample expenses
    const expenses = await Promise.all([
      prisma.expense.create({
        data: {
          userId: user.id,
          title: 'Food - Pizza Night',
          amount: 500,
          category: 'Food',
          description: 'Dinner with Sam',
          photo: '🍕',
        },
      }),
      prisma.expense.create({
        data: {
          userId: user.id,
          title: 'Travel - Uber Ride',
          amount: 120,
          category: 'Travel',
          description: 'To College',
          photo: '🚗',
        },
      }),
      prisma.expense.create({
        data: {
          userId: user.id,
          title: 'Shopping - T-Shirt',
          amount: 700,
          category: 'Shopping',
          description: 'Myntra Sale',
          photo: '👕',
        },
      }),
    ]);

    console.log('✅ Created sample expenses:', expenses.length);

    // Create sample transactions
    const transactions = await Promise.all([
      prisma.transaction.create({
        data: {
          userId: user.id,
          friendId: friends[0].id,
          friendshipId: friendships[0].id,
          amount: 200,
          type: 'GAVE',
          description: 'Lunch money',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          friendId: friends[1].id,
          friendshipId: friendships[1].id,
          amount: 100,
          type: 'TOOK',
          description: 'Movie ticket',
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          friendId: friends[2].id,
          friendshipId: friendships[2].id,
          amount: 300,
          type: 'GAVE',
          description: 'Shopping money',
        },
      }),
    ]);

    console.log('✅ Created sample transactions:', transactions.length);

    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 Sample Data Created:');
    console.log(`👤 User: ${user.email}`);
    console.log(`👥 Friends: ${friends.length}`);
    console.log(`🤝 Friendships: ${friendships.length}`);
    console.log(`💰 Expenses: ${expenses.length}`);
    console.log(`📝 Transactions: ${transactions.length}`);
    
    console.log('\n🚀 You can now:');
    console.log('1. Start the app: npm run dev');
    console.log('2. Login with: demo@hisab.com / demo123');
    console.log('3. View data: npx prisma studio');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
