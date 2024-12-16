-- Create whatsapp_followup_config table
CREATE TABLE whatsapp_followup_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  new_customer_enabled BOOLEAN DEFAULT false,
  new_customer_delay INTEGER DEFAULT 1,
  new_customer_message TEXT,
  pending_payment_enabled BOOLEAN DEFAULT false,
  pending_payment_delay INTEGER DEFAULT 1,
  pending_payment_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT whatsapp_followup_delay_check CHECK (
    new_customer_delay >= 1 AND 
    new_customer_delay <= 30 AND
    pending_payment_delay >= 1 AND
    pending_payment_delay <= 30
  )
);

-- Add indexes
CREATE INDEX idx_whatsapp_followup_store ON whatsapp_followup_config(store_id);

-- Enable RLS
ALTER TABLE whatsapp_followup_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view followup config from their stores"
  ON whatsapp_followup_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = whatsapp_followup_config.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage followup config from their stores"
  ON whatsapp_followup_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = whatsapp_followup_config.store_id
      AND stores.user_id = auth.uid()
    )
  );