-- Миграция: приватные курсы + доступ группам

-- 1) Признак публичности курса
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 2) Связь курсов с группами
CREATE TABLE IF NOT EXISTS public.course_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_course_groups_course ON public.course_groups(course_id);
CREATE INDEX IF NOT EXISTS idx_course_groups_group ON public.course_groups(group_id);

ALTER TABLE public.course_groups ENABLE ROW LEVEL SECURITY;

-- 3) Политики для course_groups
CREATE POLICY "Admin manage course groups" ON public.course_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users read course groups" ON public.course_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = course_groups.group_id
      AND group_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.group_id = course_groups.group_id
      AND enrollments.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 4) Обновить RLS на courses
DROP POLICY IF EXISTS "Anyone authenticated can read courses" ON public.courses;

CREATE POLICY "Users read public courses" ON public.courses
  FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "Users read courses in their groups" ON public.courses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.course_groups cg
      JOIN public.group_members gm ON gm.group_id = cg.group_id
      WHERE cg.course_id = courses.id
      AND gm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.course_groups cg
      JOIN public.enrollments e ON e.group_id = cg.group_id
      WHERE cg.course_id = courses.id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users read enrolled courses" ON public.courses
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = courses.id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin read all courses" ON public.courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
