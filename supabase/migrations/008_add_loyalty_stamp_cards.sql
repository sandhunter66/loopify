-- Create loyalty_stamp_cards table
CREATE TABLE loyalty_stamp_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_location TEXT,
  total_stamps INTEGER NOT NULL CHECK (total_stamps >= 4 AND total_stamps <= 20),
  reward TEXT NOT NULL,
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_loyalty_stamp_cards_store_id ON loyalty_stamp_cards(store_id);
CREATE INDEX idx_loyalty_stamp_cards_is_active ON loyalty_stamp_cards(is_active);

-- Enable RLS
ALTER TABLE loyalty_stamp_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view loyalty stamp cards from their stores"
  ON loyalty_stamp_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = loyalty_stamp_cards.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage loyalty stamp cards from their stores"
  ON loyalty_stamp_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = loyalty_stamp_cards.store_id
      AND stores.user_id = auth.uid()
    )
  );