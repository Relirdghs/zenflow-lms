-- Миграция: Изменение целей с личных на групповые
-- Goals теперь привязаны к группам, а не к отдельным пользователям

-- Добавить group_id к таблице goals
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE;

-- Сделать user_id необязательным (цели теперь для группы, а не для пользователя)
ALTER TABLE public.goals ALTER COLUMN user_id DROP NOT NULL;

-- Создать индекс для group_id
CREATE INDEX IF NOT EXISTS idx_goals_group ON public.goals(group_id);

-- Удалить старые политики RLS для goals
DROP POLICY IF EXISTS "Users manage own goals" ON public.goals;

-- Новые политики RLS для групповых целей

-- Пользователи могут читать цели своей группы
CREATE POLICY "Users read group goals" ON public.goals
  FOR SELECT USING (
    EXISTS (
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

-- Админ может создавать цели для своих групп
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

-- Админ может обновлять цели своих групп
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

-- Админ может удалять цели своих групп
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
