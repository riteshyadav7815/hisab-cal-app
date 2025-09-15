#!/bin/bash

# Hisab Calculator Database Setup Script
# This script helps you set up the database for the Hisab Calculator app

echo "🚀 Setting up Hisab Calculator Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hisab_cal_db"

# NextAuth.js
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
EOF
    echo "✅ Created .env file with generated secrets"
    echo "⚠️  Please update DATABASE_URL with your PostgreSQL credentials"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is accessible
echo "🔍 Testing database connection..."
if npx prisma db push --accept-data-loss; then
    echo "✅ Database connection successful"
    
    # Setup sample data
    echo "📊 Setting up sample data..."
    npm run db:setup
    
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update DATABASE_URL in .env with your PostgreSQL credentials"
    echo "2. Start the app: npm run dev"
    echo "3. Login with: demo@hisab.com / demo123"
    echo "4. View data: npx prisma studio"
    echo ""
else
    echo "❌ Database connection failed"
    echo "Please check your DATABASE_URL in .env file"
    echo "Make sure PostgreSQL is running and accessible"
fi
