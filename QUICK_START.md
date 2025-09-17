# 🚀 Quick Start - Hisab Calculator Database Setup

## ⚡ 5-Minute Setup (Free Database)

### Step 1: Get Free PostgreSQL Database

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign up" → Use GitHub
3. Click "Create Project" → Name: `hisab-calculator`
4. Copy the connection string (looks like this):
   ```
   postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/hisab_calculator?sslmode=require
   ```

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Use GitHub
3. Create new project → Name: `hisab-calculator`
4. Go to Settings → Database → Copy connection string

### Step 2: Create Environment File

Create `.env.local` in your project root:

```bash
# Database (replace with your connection string)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/hisab_calculator?sslmode=require"

# NextAuth (required)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-random-string"

# OAuth (optional - add later)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Step 3: Run Setup Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Add sample data
npm run db:setup
```

### Step 4: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Test Login

Use these demo credentials:
- **Email:** `demo@hisab.com`
- **Password:** `demo123`

## 🎉 You're Done!

Your Hisab Calculator is now running with:
- ✅ Database connected
- ✅ Sample data loaded
- ✅ Authentication working
- ✅ All pages functional

## 🔧 Useful Commands

```bash
# View database in browser
npm run db:studio

# Reset database (if needed)
npm run db:reset

# Generate Prisma client (after schema changes)
npm run db:generate
```

## 🚨 Troubleshooting

**Database connection error?**
- Check your `DATABASE_URL` in `.env.local`
- Make sure the database is running
- Try `npm run db:push` again

**Can't login?**
- Make sure you ran `npm run db:setup`
- Check if demo user was created

**Need help?**
- See `DATABASE_SETUP.md` for detailed instructions
- Check the console for error messages

## 🌐 Next Steps

1. **Deploy to Vercel** (free)
2. **Customize the app** for your needs
3. **Add real data** instead of sample data
