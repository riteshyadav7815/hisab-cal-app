# 🗄️ Hisab Calculator Database Setup

This guide will help you set up the PostgreSQL database for the Hisab Calculator app.

## 🚀 Quick Start (5 minutes)

### Option 1: Automated Setup
```bash
# Run the automated setup script
./setup-database.sh
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database
npx prisma db push

# 5. Setup sample data
npm run db:setup

# 6. Start the app
npm run dev
```

## 📋 Prerequisites

### 1. PostgreSQL Database
You need a PostgreSQL database running. Choose one option:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb hisab_cal_db
```

#### Option B: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name hisab-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=hisab_cal_db \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud Database
- **Neon** (Free tier): https://neon.tech
- **Supabase** (Free tier): https://supabase.com
- **Railway** (Free tier): https://railway.app

### 2. Environment Variables
Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hisab_cal_db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

## 🗃️ Database Schema

The database includes the following models:

### Core Models
- **User**: User accounts with authentication
- **Friend**: Contact information for friends
- **Friendship**: Balance tracking between users and friends
- **Expense**: Personal expense records
- **Transaction**: Money transactions between users and friends

### NextAuth.js Models
- **Account**: OAuth provider accounts
- **Session**: User sessions
- **VerificationToken**: Email verification tokens

## 🛠️ Available Commands

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio (GUI)
npm run db:setup       # Setup sample data
npm run db:reset       # Reset database and setup sample data

# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
```

## 📊 Sample Data

The setup script creates:
- **1 Demo User**: `demo@hisab.com` / `demo123`
- **3 Sample Friends**: Aman, Ravi, Priya
- **3 Sample Expenses**: Food, Travel, Shopping
- **3 Sample Transactions**: Various money exchanges

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Can't reach database server
```
**Solution**: Check if PostgreSQL is running and DATABASE_URL is correct.

#### 2. Prisma Client Not Generated
```
Error: @prisma/client did not initialize yet
```
**Solution**: Run `npx prisma generate`

#### 3. Schema Validation Error
```
Error: Prisma schema validation
```
**Solution**: Run `npx prisma format` to fix schema formatting.

#### 4. Permission Denied
```
Error: permission denied for database
```
**Solution**: Check database user permissions and credentials.

### Reset Everything
```bash
# Reset database completely
npm run db:reset

# Or manually
npx prisma db push --force-reset
npm run db:setup
```

## 🌐 Production Deployment

### Vercel + Neon
1. Create database on Neon
2. Add DATABASE_URL to Vercel environment variables
3. Deploy to Vercel

### Railway
1. Connect GitHub repository
2. Add PostgreSQL service
3. Deploy automatically

## 📱 Testing the App

1. Start the app: `npm run dev`
2. Open: http://localhost:3000
3. Login with: `demo@hisab.com` / `demo123`
4. Explore the dashboard and features

## 🎯 Features Available

- ✅ User authentication (email/password + OAuth)
- ✅ Friend management
- ✅ Balance tracking
- ✅ Expense recording
- ✅ Transaction history
- ✅ Dashboard with statistics
- ✅ Responsive design
- ✅ 3D animated UI

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check the console for error messages

---

**Happy coding! 🚀**
