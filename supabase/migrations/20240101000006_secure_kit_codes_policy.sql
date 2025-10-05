-- Secure RLS policies for kit_codes table
-- This ensures security while allowing necessary operations

-- Drop the overly permissive policy
DROP POLICY "Kit codes viewable for redemption" ON kit_codes;

-- Create secure policies for kit_codes

-- 1. SELECT policy: Users can only view their own codes, admins can see all
CREATE POLICY "Secure kit codes view policy" ON kit_codes FOR SELECT
USING (
  -- Allow viewing codes you own
  (redeemed_by = auth.uid())
  OR
  -- Allow admins to see all codes
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. UPDATE policy: Only allow users to redeem unredeemed codes or admins to manage all
CREATE POLICY "Secure kit codes update policy" ON kit_codes FOR UPDATE
USING (
  -- Allow users to redeem unredeemed codes (set redeemed_by to their ID)
  (redeemed_by IS NULL AND auth.uid() IS NOT NULL)
  OR
  -- Allow users to update their own codes (usage tracking, etc.)
  (redeemed_by = auth.uid())
  OR
  -- Allow admins to update any code
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- Ensure users can only set redeemed_by to their own ID
  (redeemed_by IS NULL OR redeemed_by = auth.uid())
  OR
  -- Allow admins to set any redeemed_by value
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. INSERT policy: Only admins can create new kit codes
CREATE POLICY "Only admins can create kit codes" ON kit_codes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. DELETE policy: Only admins can delete kit codes
CREATE POLICY "Only admins can delete kit codes" ON kit_codes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add a function to safely redeem kit codes
CREATE OR REPLACE FUNCTION redeem_kit_code_safe(code_to_redeem TEXT, user_id UUID)
RETURNS JSON AS $$
DECLARE
  kit_code_record RECORD;
  existing_user_code RECORD;
BEGIN
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;

  -- Check if user already has a kit code (double-check)
  SELECT * INTO existing_user_code
  FROM kit_codes
  WHERE redeemed_by = user_id;

  IF FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User already has a kit code');
  END IF;

  -- Find the kit code (only unredeemed, active codes)
  SELECT * INTO kit_code_record
  FROM kit_codes
  WHERE code = code_to_redeem
    AND is_active = true
    AND redeemed_by IS NULL;

  -- Check if code exists and is available
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or already redeemed kit code');
  END IF;

  -- Redeem the kit code atomically
  UPDATE kit_codes
  SET redeemed_by = user_id
  WHERE id = kit_code_record.id
    AND redeemed_by IS NULL; -- Double-check it's still unredeemed

  -- Check if the update was successful
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Kit code was redeemed by another user');
  END IF;

  -- Return success with kit code details
  RETURN json_build_object(
    'success', true,
    'kit_code', json_build_object(
      'id', kit_code_record.id,
      'code', kit_code_record.code,
      'kit_type', kit_code_record.kit_type,
      'max_generations', kit_code_record.max_generations
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION redeem_kit_code_safe(TEXT, UUID) TO authenticated;
