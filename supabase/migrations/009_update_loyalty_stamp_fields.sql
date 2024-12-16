-- Rename columns
ALTER TABLE loyalty_stamp_cards 
  RENAME COLUMN event_name TO promotion_name;

ALTER TABLE loyalty_stamp_cards 
  RENAME COLUMN event_location TO tagline;

-- Update column comments
COMMENT ON COLUMN loyalty_stamp_cards.promotion_name IS 'Name of the loyalty promotion';
COMMENT ON COLUMN loyalty_stamp_cards.tagline IS 'Short promotional tagline';