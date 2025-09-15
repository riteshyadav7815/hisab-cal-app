-- Add indexes for better query performance
-- This file should be run manually or integrated into Prisma migrations

-- Index for expenses by userId and date (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_expenses_userid_date ON expenses(userId, date DESC);

-- Index for expenses by userId and category
CREATE INDEX IF NOT EXISTS idx_expenses_userid_category ON expenses(userId, category);

-- Index for expenses by userId and createdAt (for pagination)
CREATE INDEX IF NOT EXISTS idx_expenses_userid_createdat ON expenses(userId, createdAt DESC);

-- Index for expenses by userId, date range and category (reports queries)
CREATE INDEX IF NOT EXISTS idx_expenses_userid_date_category ON expenses(userId, date, category);

-- Index for friendships by userId
CREATE INDEX IF NOT EXISTS idx_friendships_userid ON friendships(userId);

-- Index for transactions by userId and date
CREATE INDEX IF NOT EXISTS idx_transactions_userid_date ON transactions(userId, date DESC);

-- Index for transactions by userId and createdAt
CREATE INDEX IF NOT EXISTS idx_transactions_userid_createdat ON transactions(userId, createdAt DESC);

-- Composite index for expense aggregations
CREATE INDEX IF NOT EXISTS idx_expenses_aggregation ON expenses(userId, date, category, amount);

-- Index for user session lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Update table statistics for query planner
ANALYZE expenses;
ANALYZE friendships;
ANALYZE transactions;
ANALYZE users;