-- ZenFlow LMS: profiles, courses, lessons, lesson_blocks, groups, enrollments, messages, goals
-- Run in Supabase SQL Editor or via Supabase CLI

-- Role enum for profiles
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'client');

-- Course level enum
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Lesson block type enum
CREATE TYPE block_type AS ENUM ('video', 'text', 'image', 'slider', 'quiz', 'checklist', 'timer', 'h1', 'h2', 'callout', 'link');

-- Profiles (synced with auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  level course_level NOT NULL DEFAULT 'beginner',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lesson blocks (ZenBuilder content)
CREATE TABLE public.lesson_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  type block_type NOT NULL,
  content JSONB DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Groups (admin-managed)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enrollments (user-course-group)
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  progress_percent NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Messages (chat: sender, receiver or thread)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_id UUID,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User goals (client personal goals)
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_lessons_course ON public.lessons(course_id);
CREATE INDEX idx_lesson_blocks_lesson ON public.lesson_blocks(lesson_id);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_thread ON public.messages(thread_id);
CREATE INDEX idx_goals_user ON public.goals(user_id);
CREATE INDEX idx_groups_admin ON public.groups(admin_id);

-- Trigger: sync auth.users -> profiles on signup
-- ВАЖНО: Триггер создается отдельно через Supabase Dashboard (см. инструкцию ниже)
-- Функция создается здесь, но триггер нужно создать вручную через Dashboard

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: enable on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own; super_admin can read/update all (including role)
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admin can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can update any profile (role)" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Courses: clients read enrolled; admins read/create/update own or any if super_admin
CREATE POLICY "Anyone authenticated can read courses" ON public.courses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can create courses" ON public.courses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admin can update own or super_admin any" ON public.courses
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can delete courses" ON public.courses
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Lessons: follow course access
CREATE POLICY "Read lessons" ON public.lessons
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lessons.course_id AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')))
  );

-- Lesson blocks: same as lessons
CREATE POLICY "Read lesson_blocks" ON public.lesson_blocks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin manage lesson_blocks" ON public.lesson_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE l.id = lesson_blocks.lesson_id
      AND (c.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
    )
  );

-- Groups: admins manage own; super_admin all
CREATE POLICY "Read groups" ON public.groups
  FOR SELECT TO authenticated USING (
    admin_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR EXISTS (SELECT 1 FROM public.enrollments WHERE group_id = groups.id AND user_id = auth.uid())
  );

CREATE POLICY "Admin manage own groups" ON public.groups
  FOR ALL USING (
    admin_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Enrollments: users read own; admin/super_admin manage
CREATE POLICY "Users read own enrollments" ON public.enrollments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin read enrollments in their groups" ON public.enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = enrollments.group_id AND admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admin manage enrollments" ON public.enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Messages: participants and super_admin (view all)
CREATE POLICY "Users read own messages (sender or receiver)" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Super admin read all messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Users send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Goals: user owns
CREATE POLICY "Users manage own goals" ON public.goals
  FOR ALL USING (user_id = auth.uid());

-- Storage bucket for course media (optional; create in Dashboard or here)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', true);
