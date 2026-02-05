-- ZenFlow LMS: Новые фичи - favorites, reviews, promotions, user_preferences, course_views, notifications
-- Добавление полей в courses для рейтингов, просмотров и SEO

-- 1. Таблица favorites (избранное)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_course ON public.favorites(course_id);

-- 2. Таблица reviews (отзывы и рейтинги)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_course ON public.reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_moderated ON public.reviews(is_moderated);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

-- 3. Таблица promotions (промо-акции)
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
  coupon_code TEXT UNIQUE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active, ends_at);

-- 4. Таблица user_preferences (настройки пользователя)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Таблица course_views (история просмотров для рекомендаций)
CREATE TABLE IF NOT EXISTS public.course_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_views_user ON public.course_views(user_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_views_course ON public.course_views(course_id);

-- 6. Таблица notifications (уведомления)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('enrollment', 'lesson_completed', 'new_course', 'promotion', 'message')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- 7. Добавить поля в courses
ALTER TABLE public.courses 
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS location_city TEXT DEFAULT 'Алматы';

-- 8. Функция для обновления рейтинга курса
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.courses
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0)
      FROM public.reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        AND is_moderated = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
        AND is_moderated = true
    )
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Триггер для автоматического обновления рейтинга
DROP TRIGGER IF EXISTS update_course_rating_trigger ON public.reviews;
CREATE TRIGGER update_course_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_rating();

-- 9. Функция для увеличения счетчика просмотров
CREATE OR REPLACE FUNCTION public.increment_course_view()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.courses
  SET view_count = view_count + 1
  WHERE id = NEW.course_id;
  
  RETURN NEW;
END;
$$;

-- Триггер для автоматического увеличения счетчика просмотров
DROP TRIGGER IF EXISTS increment_course_view_trigger ON public.course_views;
CREATE TRIGGER increment_course_view_trigger
  AFTER INSERT ON public.course_views
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_course_view();

-- 10. RLS: Включить RLS на всех новых таблицах
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 11. RLS политики для favorites
CREATE POLICY "Users can read own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 12. RLS политики для reviews
-- Все видят модерационные отзывы
CREATE POLICY "Anyone can read moderated reviews" ON public.reviews
  FOR SELECT USING (is_moderated = true);

-- Пользователи видят свои отзывы (даже немодерационные)
CREATE POLICY "Users can read own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Админы видят все отзывы для модерации
CREATE POLICY "Admins can read all reviews" ON public.reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Пользователи могут создавать свои отзывы
CREATE POLICY "Users can create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут обновлять свои отзывы
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Админы могут модерировать отзывы
CREATE POLICY "Admins can moderate reviews" ON public.reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 13. RLS политики для promotions
-- Все видят активные промо
CREATE POLICY "Anyone can read active promotions" ON public.promotions
  FOR SELECT USING (is_active = true AND ends_at > now());

-- Админы могут управлять промо
CREATE POLICY "Admins can manage promotions" ON public.promotions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 14. RLS политики для user_preferences
CREATE POLICY "Users can read own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 15. RLS политики для course_views
CREATE POLICY "Users can read own course views" ON public.course_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own course views" ON public.course_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 16. RLS политики для notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Система может создавать уведомления (через service role или триггеры)
-- Для создания уведомлений используется SECURITY DEFINER функция или service role

-- 17. Функция для создания уведомления (для использования в триггерах)
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- 18. Триггер для создания уведомления при записи на курс
CREATE OR REPLACE FUNCTION public.notify_on_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title TEXT;
BEGIN
  SELECT title INTO v_course_title
  FROM public.courses
  WHERE id = NEW.course_id;
  
  PERFORM public.create_notification(
    NEW.user_id,
    'enrollment',
    'Вы записались на курс',
    'Вы успешно записались на курс "' || COALESCE(v_course_title, 'Курс') || '"',
    '/dashboard/courses/' || NEW.course_id
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_enrollment_trigger ON public.enrollments;
CREATE TRIGGER notify_on_enrollment_trigger
  AFTER INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_enrollment();

-- 19. Триггер для создания уведомления при завершении урока (когда прогресс курса достигает 100%)
CREATE OR REPLACE FUNCTION public.notify_on_course_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course_title TEXT;
BEGIN
  -- Проверяем, достиг ли прогресс 100%
  IF NEW.progress_percent >= 100 AND (OLD.progress_percent IS NULL OR OLD.progress_percent < 100) THEN
    SELECT title INTO v_course_title
    FROM public.courses
    WHERE id = NEW.course_id;
    
    PERFORM public.create_notification(
      NEW.user_id,
      'lesson_completed',
      'Курс завершен!',
      'Поздравляем! Вы завершили курс "' || COALESCE(v_course_title, 'Курс') || '"',
      '/dashboard/courses/' || NEW.course_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_course_completion_trigger ON public.enrollments;
CREATE TRIGGER notify_on_course_completion_trigger
  AFTER UPDATE OF progress_percent ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_course_completion();
