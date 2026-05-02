// Central API client for all NexusEstate services
// Reads base URLs from Next.js public env vars (or falls back to localhost)

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
const SWAP_ENGINE_URL = process.env.NEXT_PUBLIC_SWAP_ENGINE_URL || 'http://localhost:8001';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexus_token');
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Login with email + password (register if account doesn't exist) */
export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/** Register a new account */
export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  role = 'Nomad'
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
}

/** Google login using JWT token from Google Identity Services */
export async function loginWithGoogle(token: string, role = 'Nomad'): Promise<AuthResponse> {
  return apiFetch<AuthResponse>(`${BACKEND_URL}/api/auth/google`, {
    method: 'POST',
    body: JSON.stringify({ token, role }),
  });
}

// ─── Properties ───────────────────────────────────────────────────────────────

export async function fetchProperties(params?: {
  city?: string;
  category?: string;
  limit?: number;
  listing_type?: string;
}) {
  const qs = new URLSearchParams(
    Object.entries(params || {}).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString();
  return apiFetch<{ properties: unknown[] }>(
    `${BACKEND_URL}/api/properties${qs ? `?${qs}` : ''}`
  );
}

// ─── AI Service ───────────────────────────────────────────────────────────────

export interface ValuationFeatures {
  city: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  has_swimming_pool: number;
  has_gym: number;
  has_clubhouse: number;
  has_sports_ground: number;
  dist_metro_km: number;
  dist_bus_km: number;
  dist_highway_km: number;
}

export interface ValuationResult {
  predicted_value: number;
}

export interface DesirabilityResult {
  desirability_score: number;
  breakdown: {
    base: number;
    amenity_bonus: number;
    proximity_penalty: number;
  };
}

export interface FraudResult {
  listed_price: number;
  is_anomaly: boolean;
}

/** Get ML-predicted market value for a property */
export async function predictValuation(features: ValuationFeatures): Promise<ValuationResult> {
  return apiFetch<ValuationResult>(`${AI_SERVICE_URL}/predict`, {
    method: 'POST',
    body: JSON.stringify({ features }),
  });
}

/** Calculate desirability score based on amenities + proximity */
export async function getDesirabilityScore(features: ValuationFeatures): Promise<DesirabilityResult> {
  return apiFetch<DesirabilityResult>(`${AI_SERVICE_URL}/desirability-score`, {
    method: 'POST',
    body: JSON.stringify({ features }),
  });
}

/** Run fraud/anomaly detection on a listing */
export async function analyzeFraud(listed_price: number, location: string): Promise<FraudResult> {
  return apiFetch<FraudResult>(`${AI_SERVICE_URL}/analyze-fraud`, {
    method: 'POST',
    body: JSON.stringify({ listed_price, location }),
  });
}

/** Get list of cities supported by the AI ML models */
export async function fetchSupportedCities(): Promise<{ cities: string[] }> {
  return apiFetch<{ cities: string[] }>(`${AI_SERVICE_URL}/supported-cities`);
}

/** Rank properties using AI desirability model */
export async function rankProperties(
  properties: { id: string, has_pool?: boolean, has_gym?: boolean, has_clubhouse?: boolean, has_sports_ground?: boolean, dist_metro_km?: number }[],
  preferences: string[]
): Promise<{ ranked_ids: string[] }> {
  return apiFetch<{ ranked_ids: string[] }>(`${AI_SERVICE_URL}/rank-properties`, {
    method: 'POST',
    body: JSON.stringify({ properties, preferences }),
  });
}


// ─── Swap Engine ──────────────────────────────────────────────────────────────

export interface SwapRequest {
  id: number;
  user_id: number;
  current_city: string;
  desired_city: string;
}

export interface CycleResult {
  message: string;
  cycles_found: number;
  cycles: number[][];
  nodes: SwapRequest[];
}

/** Detect multi-party lease swap cycles using the graph engine */
export async function detectSwapCycles(): Promise<CycleResult> {
  return apiFetch<CycleResult>(`${BACKEND_URL}/api/cycles/detect`, {
    method: 'POST',
  });
}

/** Health checks for all services */
export async function checkServiceHealth() {
  const check = async (url: string, name: string) => {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
      return { name, ok: res.ok };
    } catch {
      return { name, ok: false };
    }
  };
  return Promise.all([
    check(BACKEND_URL, 'Backend'),
    check(AI_SERVICE_URL, 'AI Service'),
    check(SWAP_ENGINE_URL, 'Swap Engine'),
  ]);
}
