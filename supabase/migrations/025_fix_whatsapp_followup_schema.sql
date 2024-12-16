-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS whatsapp_followup_jobs CASCADE;
DROP TABLE IF EXISTS whatsapp_followup_config CASCADE;

-- Create whatsapp_followup_config table with correct schema
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

-- Create whatsapp_followup_jobs table
CREATE TABLE whatsapp_followup_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('new_customer', 'pending_payment')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_whatsapp_followup_jobs_store ON whatsapp_followup_jobs(store_id);
CREATE INDEX idx_whatsapp_followup_jobs_customer ON whatsapp_followup_jobs(customer_id);
CREATE INDEX idx_whatsapp_followup_jobs_status ON whatsapp_followup_jobs(status);
CREATE INDEX idx_whatsapp_followup_jobs_scheduled ON whatsapp_followup_jobs(scheduled_for) 
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE whatsapp_followup_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_followup_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for config
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

-- Create RLS policies for jobs
CREATE POLICY "Users can view followup jobs from their stores"
  ON whatsapp_followup_jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = whatsapp_followup_jobs.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage followup jobs from their stores"
  ON whatsapp_followup_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = whatsapp_followup_jobs.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create function to schedule followup messages
CREATE OR REPLACE FUNCTION schedule_whatsapp_followup()
RETURNS TRIGGER AS $$
DECLARE
  followup_config whatsapp_followup_config%ROWTYPE;
  scheduled_time TIMESTAMP WITH TIME ZONE;
  customer_record customers%ROWTYPE;
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
      
      -- Get customer details for message variables
      SELECT * INTO customer_record FROM customers WHERE id = NEW.id;
      
      INSERT INTO whatsapp_followup_jobs (
        store_id,
        customer_id,
        job_type,
        scheduled_for,
        message,
        status
      ) VALUES (
        NEW.store_id,
        NEW.id,
        'new_customer',
        scheduled_time,
        replace(
          replace(
            followup_config.new_customer_message,
            '{first_name}',
            customer_record.first_name
          ),
          '{last_name}',
          customer_record.last_name
        ),
        'pending'
      );
    END IF;

    -- For pending payments
    IF TG_TABLE_NAME = 'orders' 
      AND NEW.status = 'pending' 
      AND followup_config.pending_payment_enabled 
    THEN
      scheduled_time := NEW.created_at + (followup_config.pending_payment_delay || ' days')::INTERVAL;
      
      -- Get customer details for message variables
      SELECT * INTO customer_record FROM customers WHERE id = NEW.customer_id;
      
      INSERT INTO whatsapp_followup_jobs (
        store_id,
        customer_id,
        job_type,
        scheduled_for,
        message,
        status
      ) VALUES (
        NEW.store_id,
        NEW.customer_id,
        'pending_payment',
        scheduled_time,
        replace(
          replace(
            followup_config.pending_payment_message,
            '{first_name}',
            customer_record.first_name
          ),
          '{last_name}',
          customer_record.last_name
        ),
        'pending'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER schedule_customer_followup
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION schedule_whatsapp_followup();

CREATE TRIGGER schedule_pending_payment_followup
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION schedule_whatsapp_followup();

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
  updated_at = NOW();