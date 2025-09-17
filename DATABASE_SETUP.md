# 🗄️ Database Setup Guide for Hisab Calculator

## 🚀 Quick Setup Options

### Option 1: Free Cloud Database (Recommended)

#### **Neon (PostgreSQL) - FREE**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project: `hisab-calculator`
4. Copy the connection string
5. Add to `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/hisab_calculator?sslmode=require"
```

#### **Supabase (PostgreSQL) - FREE**
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `hisab-calculator`
3. Go to Settings > Database
4. Copy the connection string
5. Add to `.env.local`:
```bash
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

#### **Railway (PostgreSQL) - FREE**
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy the connection string
5. Add to `.env.local`

### Option 2: Local PostgreSQL

#### **Install PostgreSQL**
```bash
# macOS (with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb hisab_calculator
```

#### **Environment Variables**
Create `.env.local`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/hisab_calculator"
```

## 🔧 Complete Environment Setup

Create `.env.local` file in project root:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

## 🚀 Database Commands

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Push Schema to Database
```bash
npx prisma db push
```

### 3. View Database (Optional)
```bash
npx prisma studio
```

## 📊 Database Schema Overview

### **User Management**
- `User` - Main user accounts
- `Session` - User sessions

### **Hisab Calculator Features**
- `Friend` - Friend profiles
- `Friendship` - User-friend relationships with balances
- `Expense` - Personal expense tracking
- `Transaction` - Money transactions between friends

### **Key Relationships**
- Users can have multiple friends (Friendship)
- Each friendship tracks balance (positive = friend owes you)
- Transactions update friendship balances
- Expenses are personal (not shared)

## 🔐 Security Notes

1. **Never commit `.env.local`** to version control
2. **Use strong passwords** for database
3. **Enable SSL** for production databases
4. **Rotate secrets** regularly

## 🚨 Troubleshooting

### Connection Issues
```bash
# Test connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset
```

### Migration Issues
```bash
# Generate migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy
```

## 📱 Next Steps After Setup

1. **Start development server**: `npm run dev`
2. **Test signup/login** functionality
3. **Add sample data** for testing
4. **Deploy to Vercel** with environment variables

## 🌐 Production Deployment

### Vercel Environment Variables
Add these in Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your domain)
- `NEXTAUTH_SECRET`

### Database Connection Pooling
For production, consider:
- **Prisma Accelerate** for connection pooling
- **Supabase** built-in pooling
- **Neon** connection pooling
