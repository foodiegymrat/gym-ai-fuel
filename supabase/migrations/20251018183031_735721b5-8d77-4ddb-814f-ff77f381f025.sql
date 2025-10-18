-- Create function to update daily summaries when meals change
CREATE OR REPLACE FUNCTION public.update_daily_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_summary_date date;
  v_user_id uuid;
  v_totals record;
BEGIN
  -- Determine which date and user to update
  IF TG_OP = 'DELETE' THEN
    v_summary_date := OLD.meal_date;
    v_user_id := OLD.user_id;
  ELSE
    v_summary_date := NEW.meal_date;
    v_user_id := NEW.user_id;
  END IF;

  -- Calculate totals for the day
  SELECT 
    COALESCE(SUM(calories), 0) as total_calories,
    COALESCE(SUM(protein), 0) as total_protein,
    COALESCE(SUM(carbs), 0) as total_carbs,
    COALESCE(SUM(fats), 0) as total_fats,
    COALESCE(SUM(fiber), 0) as total_fiber
  INTO v_totals
  FROM meals
  WHERE user_id = v_user_id AND meal_date = v_summary_date;

  -- Upsert the daily summary
  INSERT INTO daily_summaries (
    user_id,
    summary_date,
    total_calories,
    total_protein,
    total_carbs,
    total_fats,
    total_fiber
  )
  VALUES (
    v_user_id,
    v_summary_date,
    v_totals.total_calories,
    v_totals.total_protein,
    v_totals.total_carbs,
    v_totals.total_fats,
    v_totals.total_fiber
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    total_calories = v_totals.total_calories,
    total_protein = v_totals.total_protein,
    total_carbs = v_totals.total_carbs,
    total_fats = v_totals.total_fats,
    total_fiber = v_totals.total_fiber,
    updated_at = NOW();

  RETURN NULL;
END;
$$;

-- Create trigger for INSERT/UPDATE/DELETE on meals
DROP TRIGGER IF EXISTS trigger_update_daily_summary ON meals;
CREATE TRIGGER trigger_update_daily_summary
  AFTER INSERT OR UPDATE OR DELETE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_daily_summary();

-- Add unique constraint on daily_summaries to prevent duplicates
ALTER TABLE daily_summaries DROP CONSTRAINT IF EXISTS daily_summaries_user_date_unique;
ALTER TABLE daily_summaries ADD CONSTRAINT daily_summaries_user_date_unique UNIQUE (user_id, summary_date);