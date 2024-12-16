-- Drop triggers first
DROP TRIGGER IF EXISTS check_loyalty_points_expiry ON loyalty_points_config;
DROP TRIGGER IF EXISTS check_loyalty_card_expiry ON loyalty_stamp_cards;

-- Drop functions
DROP FUNCTION IF EXISTS reset_expired_loyalty_points();
DROP FUNCTION IF EXISTS reset_expired_loyalty_cards();

-- Remove is_active from loyalty_points_config
ALTER TABLE loyalty_points_config 
  DROP COLUMN IF EXISTS is_active;

-- Remove is_active from loyalty_stamp_cards
ALTER TABLE loyalty_stamp_cards 
  DROP COLUMN IF EXISTS is_active;

-- Add comments
COMMENT ON TABLE loyalty_points_config IS 'Stores loyalty points program configuration per store';
COMMENT ON TABLE loyalty_stamp_cards IS 'Stores loyalty stamp card configuration per store';