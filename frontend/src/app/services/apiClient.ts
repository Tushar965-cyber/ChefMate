/**
 * ChefMate API Client
 * Connects the React Frontend to the Render Backend API:
 * https://chefmate-rmwq.onrender.com
 *
 * Automatically falls back to local algorithms if the backend is waking up or offline.
 */

export const BACKEND_URL =
  (import.meta as any).env?.VITE_API_URL || "https://chefmate-rmwq.onrender.com";

export interface ApiHealthResponse {
  status: string;
  service: string;
  version: string;
  database_size: number;
  ai_intent_model: string;
}

export interface ApiChatResponse {
  reply: string;
  active_ingredients: string[];
  active_filters: Record<string, any>;
  results: any[];
}

export interface ApiRecommendResponse {
  success: boolean;
  count: number;
  results: any[];
  applied_filters: Record<string, any>;
  user_ingredients: string[];
}

/** Check backend health */
export async function checkBackendHealth(): Promise<ApiHealthResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/** Ask the backend chat endpoint */
export async function sendChatMessage(message: string): Promise<ApiChatResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

/** Query backend recipe recommendations */
export async function getBackendRecommendations(
  ingredients: string[],
  filters?: Record<string, any>
): Promise<ApiRecommendResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, filters: filters || {} }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
