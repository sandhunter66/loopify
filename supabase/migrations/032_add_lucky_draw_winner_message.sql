-- Add winner_message column to lucky_draw_campaigns
ALTER TABLE lucky_draw_campaigns
  ADD COLUMN winner_message TEXT DEFAULT 'Congratulations {first_name}! You''ve won {prize_name} in our lucky draw!';

-- Add is_ended column to lucky_draw_campaigns
ALTER TABLE lucky_draw_campaigns
  ADD COLUMN is_ended BOOLEAN DEFAULT false;

-- Add index for ended campaigns
CREATE INDEX idx_lucky_draw_campaigns_ended ON lucky_draw_campaigns(is_ended);

-- Add comment explaining the fields
COMMENT ON COLUMN lucky_draw_campaigns.winner_message IS 'Message template to send to winners via WhatsApp';
COMMENT ON COLUMN lucky_draw_campaigns.is_ended IS 'Whether the campaign has been manually ended';