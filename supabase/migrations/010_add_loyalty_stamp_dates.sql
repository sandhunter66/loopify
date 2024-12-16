-- Add date fields to loyalty_stamp_cards table
ALTER TABLE loyalty_stamp_cards 
  ADD COLUMN start_date DATE,
  ADD COLUMN end_date DATE;

-- Add check constraint to ensure end_date is after start_date
ALTER TABLE loyalty_stamp_cards
  ADD CONSTRAINT loyalty_stamp_cards_dates_check 
  CHECK (end_date >= start_date);

-- Add index for date queries
CREATE INDEX idx_loyalty_stamp_cards_dates 
  ON loyalty_stamp_cards(start_date, end_date);

-- Add function to automatically reset expired cards
CREATE OR REPLACE FUNCTION reset_expired_loyalty_cards()
RETURNS trigger AS $$
BEGIN
  IF NEW.end_date < CURRENT_DATE THEN
    NEW.is_active := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function
CREATE TRIGGER check_loyalty_card_expiry
  BEFORE UPDATE ON loyalty_stamp_cards
  FOR EACH ROW
  EXECUTE FUNCTION reset_expired_loyalty_cards();