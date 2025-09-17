# 🚀 Hisab Auth 3D - Setup Guide

## 📋 Prerequisites
- Node.js 18+ 
- PostgreSQL database

## 🗄️ Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb hisab_auth_db`
3. Update `.env.local` with your connection string

### Option 2: Cloud Database (Recommended)
- **Neon** (Free tier): https://neon.tech
- **Supabase** (Free tier): https://supabase.com
- **Railway** (Free tier): https://railway.app

## 🔧 Environment Variables

Create `.env.local` file in project root:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hisab_auth_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open:** http://localhost:3000

## 🌐 Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- **Netlify** (with serverless functions)
- **Railway** (full-stack)
- **Render** (full-stack)

## 🎨 Features
- ✨ 3D animated background with Three.js
- 🖤 Black glassmorphism design
- 👤 Username-based authentication
- ⚡ Lightning-fast Next.js 14
- 🎭 Smooth Framer Motion animations
- 📱 Fully responsive design

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **3D Graphics:** Three.js, React Three Fiber, @react-three/drei
- **Animations:** Framer Motion
- **Authentication:** NextAuth.js
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Vercel (recommended)