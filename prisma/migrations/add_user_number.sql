-- Add userNumber column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "userNumber" INTEGER;

-- Create a sequence for auto-incrementing user numbers
CREATE SEQUENCE IF NOT EXISTS user_number_seq START 1;

-- Set the default value for userNumber to use the sequence
ALTER TABLE users ALTER COLUMN "userNumber" SET DEFAULT nextval('user_number_seq');

-- Add a unique constraint to userNumber
ALTER TABLE users ADD CONSTRAINT "users_userNumber_key" UNIQUE ("userNumber");

-- Create an index on userNumber for faster lookups
CREATE INDEX IF NOT EXISTS "users_userNumber_idx" ON users("userNumber");

-- Update existing users with user numbers
-- This will assign numbers starting from 1 to existing users based on their creation order
UPDATE users 
SET "userNumber" = nextval('user_number_seq') 
WHERE "userNumber" IS NULL;

-- Ensure the sequence is set to the correct value after updating existing users
SELECT setval('user_number_seq', (SELECT COALESCE(MAX("userNumber"), 0) + 1 FROM users));