export type AppRole = "super_admin" | "admin" | "client";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type BlockType =
  | "video"
  | "text"
  | "image"
  | "slider"
  | "quiz"
  | "checklist"
  | "timer"
  | "h1"
  | "h2"
  | "callout"
  | "link";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  level: CourseLevel;
  is_public?: boolean;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface LessonBlock {
  id: string;
  lesson_id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  name: string;
  admin_id: string | null;
  avatar_url?: string | null;
  goals: string[];
  created_at?: string;
  updated_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  created_at?: string;
}

export interface CourseGroup {
  id: string;
  course_id: string;
  group_id: string;
  created_at?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  group_id: string | null;
  progress_percent: number;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  thread_id: string | null;
  text: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id?: string | null; // Deprecated: now goals are for groups
  group_id?: string | null; // New: goals belong to groups
  title: string;
  description: string | null;
  is_completed: boolean;
  deadline: string | null;
  created_at?: string;
  updated_at?: string;
}

// Block content shapes (for ZenBuilder)
export interface VideoBlockContent {
  url?: string;
  storage_path?: string;
  provider?: "youtube" | "vimeo" | "supabase";
  caption?: string;
}

export interface SliderBlockContent {
  images: { url: string; alt?: string; caption?: string }[];
}

export interface QuizBlockContent {
  question: string;
  options: { id: string; text: string; correct: boolean }[];
  explanation?: string;
}

export interface TextBlockContent {
  body: string;
  variant?: "paragraph" | "header" | "quote";
}

export interface ChecklistBlockContent {
  items: { id: string; text: string; checked: boolean }[];
  title?: string;
}

export interface TimerBlockContent {
  duration_seconds: number;
  label?: string;
}

export interface H1BlockContent {
  text: string;
}

export interface H2BlockContent {
  text: string;
}

export interface CalloutBlockContent {
  text: string;
  variant?: "info" | "warning" | "success" | "error";
  icon?: string;
}

export interface LinkBlockContent {
  url: string;
  text: string;
  variant?: "primary" | "secondary" | "outline";
}
