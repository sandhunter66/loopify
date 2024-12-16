-- Drop existing triggers first
DROP TRIGGER IF EXISTS schedule_customer_followup ON customers;
DROP TRIGGER IF EXISTS schedule_pending_payment_followup ON orders;
DROP FUNCTION IF EXISTS schedule_whatsapp_followup();

-- Create improved function to schedule followup messages
CREATE OR REPLACE FUNCTION schedule_whatsapp_followup()
RETURNS TRIGGER AS $$
DECLARE
  followup_config whatsapp_followup_config%ROWTYPE;
  scheduled_time TIMESTAMP WITH TIME ZONE;
  customer_record customers%ROWTYPE;
  message_text TEXT;
BEGIN
  -- Get followup configuration for the store
  SELECT * INTO followup_config
  FROM whatsapp_followup_config
  WHERE store_id = COALESCE(NEW.store_id, (SELECT store_id FROM customers WHERE id = NEW.customer_id));

  -- Only proceed if configuration exists
  IF FOUND THEN
    -- For new customers
    IF TG_TABLE_NAME = 'customers' AND followup_config.new_customer_enabled THEN
      -- Get customer details for message variables
      SELECT * INTO customer_record FROM customers WHERE id = NEW.id;
      
      -- Calculate scheduled time in UTC+8
      scheduled_time := NEW.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kuala_Lumpur' 
        + (followup_config.new_customer_delay || ' days')::INTERVAL;
      
      -- Replace message variables
      message_text := followup_config.new_customer_message;
      message_text := replace(message_text, '{first_name}', coalesce(customer_record.first_name, ''));
      message_text := replace(message_text, '{last_name}', coalesce(customer_record.last_name, ''));
      message_text := replace(message_text, '{phone}', coalesce(customer_record.phone, ''));
      
      -- Insert job
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
        message_text,
        'pending'
      );
    END IF;

    -- For pending payments
    IF TG_TABLE_NAME = 'orders' AND followup_config.pending_payment_enabled THEN
      -- Get customer details
      SELECT * INTO customer_record FROM customers WHERE id = NEW.customer_id;
      
      -- Only proceed if customer exists and order is pending
      IF FOUND AND NEW.status = 'pending' THEN
        -- Calculate scheduled time in UTC+8
        scheduled_time := NEW.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kuala_Lumpur'
          + (followup_config.pending_payment_delay || ' days')::INTERVAL;
        
        -- Replace message variables
        message_text := followup_config.pending_payment_message;
        message_text := replace(message_text, '{first_name}', coalesce(customer_record.first_name, ''));
        message_text := replace(message_text, '{last_name}', coalesce(customer_record.last_name, ''));
        message_text := replace(message_text, '{phone}', coalesce(customer_record.phone, ''));
        
        -- Insert job
        INSERT INTO whatsapp_followup_jobs (
          store_id,
          customer_id,
          job_type,
          scheduled_for,
          message,
          status
        ) VALUES (
          (SELECT store_id FROM customers WHERE id = NEW.customer_id),
          NEW.customer_id,
          'pending_payment',
          scheduled_time,
          message_text,
          'pending'
        );
      END IF;
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