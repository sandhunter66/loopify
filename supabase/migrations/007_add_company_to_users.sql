-- Add company column to users table
ALTER TABLE users ADD COLUMN company TEXT;

-- Add index for faster company searches
CREATE INDEX idx_users_company ON users(company);