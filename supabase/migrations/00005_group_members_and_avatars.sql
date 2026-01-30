-- Миграция: участники групп + аватар группы + обновление RLS

-- 1) Аватар группы
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2) Участники групп (отдельно от enrollments)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 3) Перенос участников из enrollments (если есть старые данные)
INSERT INTO public.group_members (group_id, user_id)
SELECT DISTINCT group_id, user_id
FROM public.enrollments
WHERE group_id IS NOT NULL
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 4) Профили: админ может читать профили для управления группами
CREATE POLICY "Admin can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 5) Groups: читать можно через group_members (и старые enrollments для совместимости)
DROP POLICY IF EXISTS "Read groups" ON public.groups;
CREATE POLICY "Read groups" ON public.groups
  FOR SELECT TO authenticated USING (
    admin_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.enrollments WHERE group_id = groups.id AND user_id = auth.uid())
  );

-- 6) Участники групп: политики RLS
CREATE POLICY "Users read own group membership" ON public.group_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin read group members" ON public.group_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_members.group_id AND admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admin insert group members" ON public.group_members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_members.group_id AND admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admin update group members" ON public.group_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_members.group_id AND admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Admin delete group members" ON public.group_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.groups WHERE id = group_members.group_id AND admin_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 7) Goals: обновить RLS для участников через group_members
DROP POLICY IF EXISTS "Users read group goals" ON public.goals;
DROP POLICY IF EXISTS "Admin create group goals" ON public.goals;
DROP POLICY IF EXISTS "Admin update group goals" ON public.goals;
DROP POLICY IF EXISTS "Admin delete group goals" ON public.goals;

CREATE POLICY "Users read group goals" ON public.goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = goals.group_id
      AND group_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.group_id = goals.group_id
      AND enrollments.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = goals.group_id
      AND groups.admin_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Admin create group goals" ON public.goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = goals.group_id
      AND groups.admin_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Admin update group goals" ON public.goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = goals.group_id
      AND groups.admin_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Admin delete group goals" ON public.goals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = goals.group_id
      AND groups.admin_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
