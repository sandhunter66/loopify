-- Create whatsapp_followup_jobs table to track scheduled messages
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

-- Add indexes for better query performance
CREATE INDEX idx_whatsapp_followup_jobs_store ON whatsapp_followup_jobs(store_id);
CREATE INDEX idx_whatsapp_followup_jobs_customer ON whatsapp_followup_jobs(customer_id);
CREATE INDEX idx_whatsapp_followup_jobs_status ON whatsapp_followup_jobs(status);
CREATE INDEX idx_whatsapp_followup_jobs_scheduled ON whatsapp_followup_jobs(scheduled_for)
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE whatsapp_followup_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create triggers to automatically schedule followup messages
CREATE TRIGGER schedule_customer_followup
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION schedule_whatsapp_followup();

CREATE TRIGGER schedule_pending_payment_followup
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION schedule_whatsapp_followup();