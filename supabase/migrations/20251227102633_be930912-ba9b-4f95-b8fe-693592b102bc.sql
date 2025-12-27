-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366F1',
  icon TEXT DEFAULT 'target',
  total_seconds BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds BIGINT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Skills policies
CREATE POLICY "Users can view their own skills" 
ON public.skills FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own skills" 
ON public.skills FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills" 
ON public.skills FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills" 
ON public.skills FOR DELETE 
USING (auth.uid() = user_id);

-- Time entries policies
CREATE POLICY "Users can view their own time entries" 
ON public.time_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries" 
ON public.time_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" 
ON public.time_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" 
ON public.time_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update skill total_seconds when time_entry is added
CREATE OR REPLACE FUNCTION public.update_skill_total_seconds()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.skills 
    SET total_seconds = total_seconds + NEW.duration_seconds,
        updated_at = now()
    WHERE id = NEW.skill_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skills 
    SET total_seconds = total_seconds - OLD.duration_seconds,
        updated_at = now()
    WHERE id = OLD.skill_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.skills 
    SET total_seconds = total_seconds - OLD.duration_seconds + NEW.duration_seconds,
        updated_at = now()
    WHERE id = NEW.skill_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger for updating skill totals
CREATE TRIGGER on_time_entry_change
  AFTER INSERT OR UPDATE OR DELETE ON public.time_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_skill_total_seconds();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();