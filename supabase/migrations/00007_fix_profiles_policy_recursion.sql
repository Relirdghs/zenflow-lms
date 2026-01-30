-- Фикс: infinite recursion в политиках на profiles
-- Политики не должны ссылаться на profiles изнутри — используем SECURITY DEFINER функцию

-- Функция: текущий пользователь — admin или super_admin (читает profiles без RLS)
CREATE OR REPLACE FUNCTION public.current_user_is_admin_or_super()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

-- Функция: текущий пользователь — super_admin
CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Удаляем политики, которые дают рекурсию (читают profiles внутри проверки на profiles)
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admin can update any profile (role)" ON public.profiles;

-- Читать все профили могут admin и super_admin (через функцию — без рекурсии)
CREATE POLICY "Admin can read all profiles" ON public.profiles
  FOR SELECT USING (public.current_user_is_admin_or_super());

-- Обновлять любой профиль (в т.ч. role) может только super_admin
CREATE POLICY "Super admin can update any profile (role)" ON public.profiles
  FOR UPDATE USING (public.current_user_is_super_admin());
