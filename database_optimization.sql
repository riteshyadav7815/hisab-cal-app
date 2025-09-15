-- Performance optimization indexes for friends and friendships
-- Run this in your Supabase SQL Editor to dramatically improve API performance

-- Index for friendships by userId (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_friendships_userid_updated" 
ON "friendships" ("userId", "updatedAt" DESC);

-- Index for friendships by userId and createdAt (for friends API)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_friendships_userid_created" 
ON "friendships" ("userId", "createdAt" DESC);

-- Composite index for optimal join performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_friendships_userid_friendid" 
ON "friendships" ("userId", "friendId");

-- Index for friends table primary lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS "idx_friends_id_name" 
ON "friends" ("id", "name");

-- Update table statistics for better query planning
ANALYZE "friendships";
ANALYZE "friends";

-- Optional: Create a materialized view for even faster reads (advanced)
-- Uncomment if you need sub-100ms performance
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS "friends_with_balances" AS
SELECT 
  f.id,
  f.name,
  f.email,
  f.phone,
  f.avatar,
  fr.id as friendship_id,
  fr.balance,
  fr."lastTransactionAt",
  fr."userId"
FROM "friendships" fr
INNER JOIN "friends" f ON f.id = fr."friendId";

CREATE INDEX ON "friends_with_balances" ("userId");
*/