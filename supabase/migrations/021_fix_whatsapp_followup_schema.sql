-- Drop existing triggers first
DROP TRIGGER IF EXISTS schedule_customer_followup ON customers;
DROP TRIGGER IF EXISTS schedule_pending_payment_followup ON orders;
DROP FUNCTION IF EXISTS schedule_whatsapp_followup();

-- Drop and recreate whatsapp_followup_config table with correct schema
DROP TABLE IF EXISTS whatsapp_followup_config CASCADE;

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

-- Recreate function with correct column names
CREATE OR REPLACE FUNCTION schedule_whatsapp_followup()
RETURNS TRIGGER AS $$
DECLARE
  followup_config whatsapp_followup_config%ROWTYPE;
  scheduled_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get followup configuration for the store
  SELECT * INTO followup_config
  FROM whatsapp_followup_config
  WHERE store_id = NEW.store_id;

  -- Only proceed if configuration exists
  IF FOUND THEN
    -- For new customers
    IF TG_TABLE_NAME = 'customers' AND followup_config.new_customer_enabled THEN
      scheduled_time := NEW.created_at + (followup_config.new_customer_delay || ' days')::INTERVAL;
      
      INSERT INTO whatsapp_followup_jobs (
        store_id,
        customer_id,
        job_type,
        scheduled_for,
        message
      ) VALUES (
        NEW.store_id,
        NEW.id,
        'new_customer',
        scheduled_time,
        followup_config.new_customer_message
      );
    END IF;

    -- For pending payments
    IF TG_TABLE_NAME = 'orders' 
      AND NEW.status = 'pending' 
      AND followup_config.pending_payment_enabled 
    THEN
      scheduled_time := NEW.created_at + (followup_config.pending_payment_delay || ' days')::INTERVAL;
      
      INSERT INTO whatsapp_followup_jobs (
        store_id,
        customer_id,
        job_type,
        scheduled_for,
        message
      ) VALUES (
        NEW.store_id,
        NEW.customer_id,
        'pending_payment',
        scheduled_time,
        followup_config.pending_payment_message
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER schedule_customer_followup
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION schedule_whatsapp_followup();

CREATE TRIGGER schedule_pending_payment_followup
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION schedule_whatsapp_followup();