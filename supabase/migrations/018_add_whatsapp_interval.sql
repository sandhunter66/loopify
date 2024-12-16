-- Add whatsapp_interval column to stores table
ALTER TABLE stores
  ADD COLUMN whatsapp_interval INTEGER DEFAULT 30
  CHECK (whatsapp_interval IN (30, 60));

-- Add comment explaining the field
COMMENT ON COLUMN stores.whatsapp_interval IS 'Interval in seconds between WhatsApp messages (30 or 60)';

-- Update existing stores to have default interval
UPDATE stores SET whatsapp_interval = 30 WHERE whatsapp_interval IS NULL;