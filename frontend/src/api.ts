/**
 * API helper - thin wrapper around fetch with auth token persistence.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./theme";

const TOKEN_KEY = "icebreaker_token";

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (options.auth !== false) {
    const t = await getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }
  if (!res.ok) {
    const err = new Error(data?.detail || `Request failed (${res.status})`);
    (err as any).status = res.status;
    (err as any).data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  // Auth
  guest: (language: string) =>
    apiFetch<{ access_token: string; user: any }>("/auth/guest", {
      method: "POST",
      body: JSON.stringify({ language }),
      auth: false,
    }),
  register: (email: string, password: string, full_name: string, language: string) =>
    apiFetch<{ access_token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name, language }),
      auth: false,
    }),
  login: (email: string, password: string) =>
    apiFetch<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false,
    }),
  me: () => apiFetch<{ user: any }>("/auth/me"),
  setLanguage: (language: string) =>
    apiFetch<{ user: any }>("/auth/language", {
      method: "POST",
      body: JSON.stringify({ language }),
    }),
  saveQuiz: (answers: { age_range?: string; dating_goal?: string; style?: string; meet_location?: string }) =>
    apiFetch<{ user: any }>("/auth/quiz", {
      method: "POST",
      body: JSON.stringify(answers),
    }),

  // Icebreakers
  categories: () =>
    apiFetch<{ categories: any[]; tones: string[] }>("/icebreakers/categories", {
      auth: false,
    }),
  library: (params: { category?: string; tone?: string; language: string; limit?: number; skip?: number }) => {
    const q = new URLSearchParams();
    if (params.category) q.set("category", params.category);
    if (params.tone) q.set("tone", params.tone);
    q.set("language", params.language);
    if (params.limit) q.set("limit", String(params.limit));
    if (params.skip) q.set("skip", String(params.skip));
    return apiFetch<{ items: any[]; total: number }>(`/icebreakers/library?${q.toString()}`, {
      auth: false,
    });
  },
  daily: (language: string) =>
    apiFetch<{ icebreaker: any; date: string }>(`/icebreakers/daily?language=${language}`),
  generate: (context: string, location: string, language: string) =>
    apiFetch<{ id: string; icebreakers: any[]; tip: string; calls_remaining: number }>(
      "/icebreakers/generate",
      {
        method: "POST",
        body: JSON.stringify({ context, location, language }),
      },
    ),
  history: () => apiFetch<{ items: any[] }>("/icebreakers/history"),
  favorites: () => apiFetch<{ items: any[] }>("/icebreakers/favorites"),
  addFavorite: (text: string, category?: string, tone?: string, language?: string, source?: string) =>
    apiFetch<{ favorite: any }>("/icebreakers/favorite", {
      method: "POST",
      body: JSON.stringify({ text, category, tone, language: language || "en", source: source || "library" }),
    }),
  removeFavorite: (id: string) =>
    apiFetch<{ ok: boolean }>(`/icebreakers/favorite/${id}`, { method: "DELETE" }),

  // Stripe
  checkoutSession: (plan: string) =>
    apiFetch<{ session_id: string; url: string }>("/checkout/session", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
  checkoutStatus: (sessionId: string) =>
    apiFetch<{ payment_status: string }>(`/checkout/status/${sessionId}`),
};
