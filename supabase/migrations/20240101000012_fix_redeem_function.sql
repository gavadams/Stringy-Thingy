-- Fix the redeem_kit_code_safe function to allow multiple kit codes per user
CREATE OR REPLACE FUNCTION redeem_kit_code_safe(code_to_redeem TEXT, user_id UUID)
RETURNS JSON AS $$
DECLARE
  kit_code_record RECORD;
BEGIN
  -- Check if user exists and is authenticated
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
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
