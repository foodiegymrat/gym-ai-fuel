-- Add columns to profiles table for onboarding data
ALTER TABLE public.profiles
ADD COLUMN age integer,
ADD COLUMN gender text,
ADD COLUMN height numeric,
ADD COLUMN weight numeric,
ADD COLUMN fitness_goal text,
ADD COLUMN maintenance_calories integer,
ADD COLUMN onboarding_completed boolean DEFAULT false;

-- Add check constraints for data validation
ALTER TABLE public.profiles
ADD CONSTRAINT age_check CHECK (age > 0 AND age < 150),
ADD CONSTRAINT height_check CHECK (height > 0 AND height < 300),
ADD CONSTRAINT weight_check CHECK (weight > 0 AND weight < 500),
ADD CONSTRAINT gender_check CHECK (gender IN ('male', 'female', 'other'));