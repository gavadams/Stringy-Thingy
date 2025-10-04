-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment kit usage
CREATE OR REPLACE FUNCTION increment_kit_usage(code_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_count INTEGER;
BEGIN
  SELECT used_count, max_generations INTO current_count, max_count
  FROM kit_codes
  WHERE id = code_id AND is_active = true;
  
  IF current_count >= max_count THEN
    RETURN false;
  END IF;
  
  UPDATE kit_codes
  SET used_count = used_count + 1
  WHERE id = code_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
