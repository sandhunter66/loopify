-- Add unique constraint on store_id
ALTER TABLE whatsapp_followup_config
  ADD CONSTRAINT whatsapp_followup_config_store_id_key UNIQUE (store_id);

-- Recreate default configurations with upsert
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