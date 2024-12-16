-- Drop existing table and recreate with correct column names
DROP TABLE IF EXISTS whatsapp_followup_config CASCADE;

CREATE TABLE whatsapp_followup_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  new_customer_enabled BOOLEAN DEFAULT false,
  new_customer_delay INTEGER DEFAULT 1,
  new_customer_message TEXT DEFAULT 'Hi {first_name}, thank you for your purchase! We hope you enjoy your items.',
  pending_payment_enabled BOOLEAN DEFAULT false,
  pending_payment_delay INTEGER DEFAULT 1,
  pending_payment_message TEXT DEFAULT 'Hi {first_name}, we noticed your payment is still pending. Need help?',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT whatsapp_followup_config_store_id_key UNIQUE (store_id),
  CONSTRAINT whatsapp_followup_delay_check CHECK (
    new_customer_delay >= 1 AND 
    new_customer_delay <= 30 AND
    pending_payment_delay >= 1 AND 
    pending_payment_delay <= 30
  )
);

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

-- Add default configurations for existing stores
INSERT INTO whatsapp_followup_config (
  store_id,
  new_customer_enabled,
  new_customer_delay,
  new_customer_message,
  pending_payment_enabled,
  pending_payment_delay,
  pending_payment_message
)
SELECT 
  id as store_id,
  false as new_customer_enabled,
  1 as new_customer_delay,
  'Hi {first_name}, thank you for your purchase! We hope you enjoy your items.' as new_customer_message,
  false as pending_payment_enabled,
  1 as pending_payment_delay,
  'Hi {first_name}, we noticed your payment is still pending. Need help?' as pending_payment_message
FROM stores
ON CONFLICT (store_id) DO UPDATE SET
  new_customer_enabled = EXCLUDED.new_customer_enabled,
  new_customer_delay = EXCLUDED.new_customer_delay,
  new_customer_message = EXCLUDED.new_customer_message,
  pending_payment_enabled = EXCLUDED.pending_payment_enabled,
  pending_payment_delay = EXCLUDED.pending_payment_delay,
  pending_payment_message = EXCLUDED.pending_payment_message,
  updated_at = NOW();