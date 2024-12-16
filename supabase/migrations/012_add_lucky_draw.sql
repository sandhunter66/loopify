-- Create lucky_draw_campaigns table
CREATE TABLE lucky_draw_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  min_spend DECIMAL(10,2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT lucky_draw_dates_check CHECK (end_date >= start_date)
);

-- Create lucky_draw_prizes table
CREATE TABLE lucky_draw_prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES lucky_draw_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  remaining_quantity INTEGER NOT NULL DEFAULT 1,
  probability DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage chance of winning
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT probability_range CHECK (probability >= 0 AND probability <= 100),
  CONSTRAINT quantity_check CHECK (remaining_quantity >= 0 AND remaining_quantity <= quantity)
);

-- Create lucky_draw_entries table
CREATE TABLE lucky_draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES lucky_draw_campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  prize_id UUID REFERENCES lucky_draw_prizes(id) ON DELETE SET NULL,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_lucky_draw_campaigns_store ON lucky_draw_campaigns(store_id);
CREATE INDEX idx_lucky_draw_campaigns_dates ON lucky_draw_campaigns(start_date, end_date);
CREATE INDEX idx_lucky_draw_prizes_campaign ON lucky_draw_prizes(campaign_id);
CREATE INDEX idx_lucky_draw_entries_campaign ON lucky_draw_entries(campaign_id);
CREATE INDEX idx_lucky_draw_entries_customer ON lucky_draw_entries(customer_id);

-- Enable RLS
ALTER TABLE lucky_draw_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucky_draw_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lucky_draw_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view lucky draw campaigns from their stores"
  ON lucky_draw_campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = lucky_draw_campaigns.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage lucky draw campaigns from their stores"
  ON lucky_draw_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = lucky_draw_campaigns.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view prizes from their campaigns"
  ON lucky_draw_prizes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lucky_draw_campaigns
      JOIN stores ON stores.id = lucky_draw_campaigns.store_id
      WHERE lucky_draw_campaigns.id = lucky_draw_prizes.campaign_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage prizes from their campaigns"
  ON lucky_draw_prizes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lucky_draw_campaigns
      JOIN stores ON stores.id = lucky_draw_campaigns.store_id
      WHERE lucky_draw_campaigns.id = lucky_draw_prizes.campaign_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view entries from their campaigns"
  ON lucky_draw_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lucky_draw_campaigns
      JOIN stores ON stores.id = lucky_draw_campaigns.store_id
      WHERE lucky_draw_campaigns.id = lucky_draw_entries.campaign_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage entries from their campaigns"
  ON lucky_draw_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lucky_draw_campaigns
      JOIN stores ON stores.id = lucky_draw_campaigns.store_id
      WHERE lucky_draw_campaigns.id = lucky_draw_entries.campaign_id
      AND stores.user_id = auth.uid()
    )
  );