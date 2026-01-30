-- Фикс рекурсии: RLS использует session_user; SELECT из profiles внутри политики
-- снова триггерит RLS на profiles → бесконечная рекурсия.
-- Решение: таблица-кэш ролей (profile_roles), синхронизируемая триггером с profiles.
-- Политики проверяют роль через эту таблицу; в ней нет обращений к profiles.

-- Таблица только (id, role); RLS только на SELECT (каждый видит свою строку).
CREATE TABLE IF NOT EXISTS public.profile_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL
);

ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;

-- Читать может только свою строку (для проверки своей роли в функциях)
DROP POLICY IF EXISTS "Users can read own role" ON public.profile_roles;
CREATE POLICY "Users can read own role" ON public.profile_roles
  FOR SELECT USING (id = auth.uid());

-- Писать только через триггер (SECURITY DEFINER); отбираем у authenticated
REVOKE INSERT, UPDATE, DELETE ON public.profile_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.profile_roles FROM anon;

-- Синхронизация profiles → profile_roles (при INSERT/UPDATE на profiles)
CREATE OR REPLACE FUNCTION public.sync_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_roles (id, role)
  VALUES (NEW.id, NEW.role)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_roles_trigger ON public.profiles;
CREATE TRIGGER sync_profile_roles_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_roles();

-- Наполняем из текущих profiles (один раз)
INSERT INTO public.profile_roles (id, role)
SELECT id, role FROM public.profiles
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- Функции проверки роли читают только profile_roles (без обращения к profiles)
CREATE OR REPLACE FUNCTION public.current_user_is_admin_or_super()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_roles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_roles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;
