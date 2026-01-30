-- Фикс рекурсии на relation "groups":
-- Политики groups читают group_members/enrollments, а их политики снова читают groups.
-- Решение: кэш group_admin (group_id, admin_id) + функция user_is_admin_of_group(gid).
-- Все проверки "админ этой группы" идут через кэш, без SELECT из groups.

-- 1) Кэш админов групп (синхронизация триггером с groups)
CREATE TABLE IF NOT EXISTS public.group_admin (
  group_id UUID PRIMARY KEY REFERENCES public.groups(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Читать/писать только через SECURITY DEFINER; клиенту не даём
REVOKE ALL ON public.group_admin FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.sync_group_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.group_admin (group_id, admin_id)
  VALUES (NEW.id, NEW.admin_id)
  ON CONFLICT (group_id) DO UPDATE SET admin_id = EXCLUDED.admin_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_group_admin_trigger ON public.groups;
CREATE TRIGGER sync_group_admin_trigger
  AFTER INSERT OR UPDATE OF admin_id ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_group_admin();

INSERT INTO public.group_admin (group_id, admin_id)
SELECT id, admin_id FROM public.groups
ON CONFLICT (group_id) DO UPDATE SET admin_id = EXCLUDED.admin_id;

-- 2) Функция: текущий пользователь — админ группы (без чтения groups)
CREATE OR REPLACE FUNCTION public.user_is_admin_of_group(gid UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_admin
    WHERE group_id = gid AND admin_id = auth.uid()
  );
$$;

-- 3) groups: убрать обращения к profiles (уже через profile_roles в 00008)
DROP POLICY IF EXISTS "Read groups" ON public.groups;
CREATE POLICY "Read groups" ON public.groups
  FOR SELECT TO authenticated USING (
    admin_id = auth.uid()
    OR public.current_user_is_super_admin()
    OR EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.enrollments WHERE group_id = groups.id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin manage own groups" ON public.groups;
CREATE POLICY "Admin manage own groups" ON public.groups
  FOR ALL USING (
    admin_id = auth.uid()
    OR public.current_user_is_super_admin()
  );

-- 4) group_members: не читать groups — использовать user_is_admin_of_group
DROP POLICY IF EXISTS "Admin read group members" ON public.group_members;
CREATE POLICY "Admin read group members" ON public.group_members
  FOR SELECT USING (
    public.user_is_admin_of_group(group_members.group_id)
    OR public.current_user_is_super_admin()
  );

DROP POLICY IF EXISTS "Admin insert group members" ON public.group_members;
CREATE POLICY "Admin insert group members" ON public.group_members
  FOR INSERT WITH CHECK (
    public.user_is_admin_of_group(group_members.group_id)
    OR public.current_user_is_super_admin()
  );

DROP POLICY IF EXISTS "Admin update group members" ON public.group_members;
CREATE POLICY "Admin update group members" ON public.group_members
  FOR UPDATE USING (
    public.user_is_admin_of_group(group_members.group_id)
    OR public.current_user_is_super_admin()
  );

DROP POLICY IF EXISTS "Admin delete group members" ON public.group_members;
CREATE POLICY "Admin delete group members" ON public.group_members
  FOR DELETE USING (
    public.user_is_admin_of_group(group_members.group_id)
    OR public.current_user_is_super_admin()
  );

-- 5) enrollments: не читать groups
DROP POLICY IF EXISTS "Admin read enrollments in their groups" ON public.enrollments;
CREATE POLICY "Admin read enrollments in their groups" ON public.enrollments
  FOR SELECT USING (
    public.user_is_admin_of_group(enrollments.group_id)
    OR public.current_user_is_super_admin()
  );

-- 6) goals: не читать groups и profiles в политиках
DROP POLICY IF EXISTS "Users read group goals" ON public.goals;
CREATE POLICY "Users read group goals" ON public.goals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.group_members WHERE group_members.group_id = goals.group_id AND group_members.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.enrollments WHERE enrollments.group_id = goals.group_id AND enrollments.user_id = auth.uid())
    OR public.user_is_admin_of_group(goals.group_id)
    OR public.current_user_is_super_admin()
  );

DROP POLICY IF EXISTS "Admin create group goals" ON public.goals;
CREATE POLICY "Admin create group goals" ON public.goals
  FOR INSERT WITH CHECK (
    public.user_is_admin_of_group(goals.group_id)
    OR public.current_user_is_super_admin()
  );

DROP POLICY IF EXISTS "Admin update group goals" ON public.goals;
CREATE POLICY "Admin update group goals" ON public.goals
  FOR UPDATE USING (
    public.user_is_admin_of_group(goals.group_id)
    OR public.current_user_is_super_admin()
  );

DROP POLICY IF EXISTS "Admin delete group goals" ON public.goals;
CREATE POLICY "Admin delete group goals" ON public.goals
  FOR DELETE USING (
    public.user_is_admin_of_group(goals.group_id)
    OR public.current_user_is_super_admin()
  );
