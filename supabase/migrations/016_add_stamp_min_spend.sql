-- Add min_spend_per_stamp column to loyalty_stamp_cards table
ALTER TABLE loyalty_stamp_cards
  ADD COLUMN min_spend_per_stamp DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Add comment explaining the field
COMMENT ON COLUMN loyalty_stamp_cards.min_spend_per_stamp IS 'Minimum spend amount required to earn 1 stamp';

-- Add check constraint to ensure non-negative value
ALTER TABLE loyalty_stamp_cards
  ADD CONSTRAINT loyalty_stamp_cards_min_spend_check CHECK (min_spend_per_stamp >= 0);