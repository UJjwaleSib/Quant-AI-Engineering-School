export interface User {
  id: number;
  email: string;
  display_name: string;
  current_module: string;
  current_lesson: number;
  xp: number;
  streak_days: number;
  created_at: string;
}

export interface Lesson {
  title: string;
  duration_min: number;
  concept: string;
  why_it_matters: string;
  code_example: string;
  exercises: Exercise[];
}

export interface Exercise {
  prompt: string;
  starter_code: string;
  hints: string[];
}

export interface Module {
  slug: string;
  title: string;
  description: string;
  lessons: LessonSummary[];
  lesson_count: number;
}

export interface LessonSummary {
  index: number;
  title: string;
  duration_min: number;
}

export interface Track {
  name: string;
  modules: Module[];
}

export interface Curriculum {
  tracks: Track[];
}

export interface ProgressSummary {
  total_lessons_completed: number;
  by_module: Record<string, number>;
  xp: number;
  streak_days: number;
  current_module: string;
  current_lesson: number;
}

export interface LessonProgress {
  module_slug: string;
  lesson_index: number;
  completed: boolean;
  time_spent_seconds: number;
  completed_at: string | null;
}

export interface ExerciseFeedback {
  feedback: string;
  score: number;
  passed: boolean;
  hint: string;
  improvement: string;
}

export interface ResearchLog {
  id: number;
  module_slug: string;
  title: string;
  hypothesis: string;
  method: string;
  results: string;
  key_insight: string;
  next_step: string;
  tags: string[];
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
