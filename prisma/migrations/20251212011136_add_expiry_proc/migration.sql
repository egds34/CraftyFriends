-- Create stored procedure to expire subscriptions
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Update subscriptions to non-premium if they are past the 1 month grace period
  UPDATE "Subscription"
  SET "isPremium" = false
  WHERE "currentPeriodEnd" < NOW() - INTERVAL '1 month'
    AND "isPremium" = true;
END;
$$ LANGUAGE plpgsql;