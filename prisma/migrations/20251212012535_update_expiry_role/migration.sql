-- Update stored procedure to expire subscriptions by changing Role
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- Downgrade users to BASIC if their subscription is past the 1 month grace period
  -- We join User and Subscription since role is on User and dates are on Subscription
  UPDATE "User" u
  SET "role" = 'BASIC'
  FROM "Subscription" s
  WHERE u."userId" = s.id
    AND s."currentPeriodEnd" < NOW() - INTERVAL '1 month'
    AND u."role" = 'PREMIUM'; -- Only downgrade if they are currently PREMIUM
END;
$$ LANGUAGE plpgsql;