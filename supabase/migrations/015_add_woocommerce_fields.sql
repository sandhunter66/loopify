-- Add WooCommerce fields to stores table
ALTER TABLE stores
  ADD COLUMN woo_consumer_key TEXT,
  ADD COLUMN woo_consumer_secret TEXT;

-- Add indexes for better query performance
CREATE INDEX idx_stores_woo_fields ON stores(woo_consumer_key, woo_consumer_secret)
  WHERE woo_consumer_key IS NOT NULL AND woo_consumer_secret IS NOT NULL;