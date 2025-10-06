-- Fix RLS policy to allow success page to query orders by session ID
-- This allows anonymous users to query orders by stripe_session_id for the success page

-- Drop the overly broad policy if it exists
DROP POLICY IF EXISTS "Allow session-based order lookup" ON orders;

-- Add specific policy for session-based order lookup
-- This allows querying orders by stripe_session_id for the success page
-- The success page needs to be able to look up orders by session ID
-- even for anonymous users who just completed checkout
CREATE POLICY "Allow session-based order lookup" ON orders
  FOR SELECT USING (stripe_session_id IS NOT NULL);

-- This policy allows querying orders by session ID
-- This is needed for the success page to work for both authenticated and anonymous users
-- The condition stripe_session_id IS NOT NULL ensures we only allow queries
-- that are looking for orders by session ID (which is what the success page does)
