-- Add plan column to users table with default value
ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium', 'enterprise'));

-- Update existing users to have the free plan
UPDATE users SET plan = 'free' WHERE plan IS NULL;

-- Make plan column NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN plan SET NOT NULL;

-- Add index for faster queries on plan
CREATE INDEX idx_users_plan ON users(plan);

-- Update RLS policies to include plan-based access
CREATE POLICY "Users can view their own plan"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own plan"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Only allow valid plan values
    plan IN ('free', 'basic', 'premium', 'enterprise')
  );