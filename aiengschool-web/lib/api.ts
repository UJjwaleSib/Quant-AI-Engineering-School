const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aes_token");
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ access_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, display_name: string) =>
      apiFetch<{ access_token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, display_name }),
      }),
    me: () => apiFetch<import("./types").User>("/auth/me"),
  },
  curriculum: {
    getAll: () => apiFetch<import("./types").Curriculum>("/lessons/curriculum"),
    getModule: (slug: string) => apiFetch<import("./types").Module>(`/lessons/${slug}`),
    getLesson: (slug: string, index: number) =>
      apiFetch<import("./types").Lesson>(`/lessons/${slug}/${index}`),
  },
  progress: {
    getSummary: () => apiFetch<import("./types").ProgressSummary>("/progress/summary"),
    getAll: () => apiFetch<import("./types").LessonProgress[]>("/progress/"),
    completeLesson: (module_slug: string, lesson_index: number, time_spent_seconds: number) =>
      apiFetch("/progress/complete-lesson", {
        method: "POST",
        body: JSON.stringify({ module_slug, lesson_index, time_spent_seconds }),
      }),
  },
  exercises: {
    submit: (data: {
      module_slug: string;
      lesson_index: number;
      exercise_index: number;
      user_code: string;
      execution_output: string;
    }) =>
      apiFetch<import("./types").ExerciseFeedback>("/exercises/submit", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  researchLogs: {
    getAll: () => apiFetch<import("./types").ResearchLog[]>("/research-logs/"),
    create: (data: Omit<import("./types").ResearchLog, "id" | "created_at">) =>
      apiFetch<import("./types").ResearchLog>("/research-logs/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch(`/research-logs/${id}`, { method: "DELETE" }),
  },
  chat: {
    send: (data: {
      messages: import("./types").ChatMessage[];
      module_slug?: string;
      lesson_title?: string;
      user_code?: string;
    }) =>
      apiFetch<{ reply: string }>("/chat/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
