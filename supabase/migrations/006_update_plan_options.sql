-- First drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_plan_check;

-- Update any 'free' plans to 'basic'
UPDATE users SET plan = 'basic' WHERE plan = 'free';

-- Add new check constraint with only allowed values
ALTER TABLE users 
  ADD CONSTRAINT users_plan_check 
  CHECK (plan IN ('basic', 'premium', 'enterprise'));

-- Update default value
ALTER TABLE users 
  ALTER COLUMN plan 
  SET DEFAULT 'basic';

-- Update the RLS policy for plan updates
DROP POLICY IF EXISTS "Users can update their own plan" ON users;
CREATE POLICY "Users can update their own plan"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    plan IN ('basic', 'premium', 'enterprise')
  );