-- Migration: Allow clients to create and update their own enrollments
-- Fixes "Enroll" errors for обычных пользователей

-- Users can create their own enrollments
CREATE POLICY "Users create own enrollments" ON public.enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own enrollments (progress)
CREATE POLICY "Users update own enrollments" ON public.enrollments
  FOR UPDATE USING (user_id = auth.uid());

-- Optional: users can delete their own enrollments (uncomment if needed)
-- CREATE POLICY "Users delete own enrollments" ON public.enrollments
--   FOR DELETE USING (user_id = auth.uid());
