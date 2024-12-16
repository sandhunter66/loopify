-- Create loyalty_points_config table
CREATE TABLE loyalty_points_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  points_per_rm DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  reward_description TEXT NOT NULL,
  terms TEXT,
  min_spend DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT loyalty_points_dates_check CHECK (end_date >= start_date)
);

-- Add indexes
CREATE INDEX idx_loyalty_points_store ON loyalty_points_config(store_id);
CREATE INDEX idx_loyalty_points_dates ON loyalty_points_config(start_date, end_date);

-- Enable RLS
ALTER TABLE loyalty_points_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view loyalty points config from their stores"
  ON loyalty_points_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = loyalty_points_config.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage loyalty points config from their stores"
  ON loyalty_points_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = loyalty_points_config.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create function to automatically deactivate expired configs
CREATE OR REPLACE FUNCTION reset_expired_loyalty_points()
RETURNS trigger AS $$
BEGIN
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER check_loyalty_points_expiry
  BEFORE UPDATE ON loyalty_points_config
  FOR EACH ROW
  EXECUTE FUNCTION reset_expired_loyalty_points();