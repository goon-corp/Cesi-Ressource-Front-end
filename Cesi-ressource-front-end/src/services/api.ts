const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

// ─── Token storage ───────────────────────────────────────────────────────────

const TOKEN_KEY = 'access_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Query params helper ──────────────────────────────────────────────────────

export type QueryParams = Record<string, string | number | boolean | null | undefined | string[]>;

function buildUrl(path: string, params?: QueryParams): string {
  if (!params) return `${API_URL}${path}`;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else {
      qs.append(key, String(value));
    }
  }
  const queryString = qs.toString();
  return queryString ? `${API_URL}${path}?${queryString}` : `${API_URL}${path}`;
}

// ─── Result pattern ───────────────────────────────────────────────────────────

interface ResultResponse<T = unknown> {
  is_success: boolean;
  error: string | null;
  errors: string[];
  data?: T;
}

function extractApiResult<T>(json: unknown): T {
  const result = json as ResultResponse<T>;
  if (!result.is_success) {
    const message =
      result.errors?.length
        ? result.errors.join(', ')
        : result.error ?? 'Une erreur est survenue';
    throw new ApiError(422, message);
  }
  return result.data as T;
}

function extractErrorMessage(payload: unknown, extractResult: boolean, status: number): string {
  if (extractResult) {
    const result = payload as Partial<ResultResponse>;
    if (result?.errors?.length) return result.errors.join(', ');
    if (result?.error) return result.error;
  }
  const p = payload as { message?: string; error?: string };
  return p?.message ?? p?.error ?? `Erreur ${status}`;
}

// ─── Token refresh ────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (API_KEY) headers['x-api-key'] = API_KEY;

      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        clearAccessToken();
        onSessionExpired?.();
        throw new ApiError(response.status, 'Session expirée');
      }

      const data = await response.json() as { access_token: string };
      setAccessToken(data.access_token);
      return data.access_token;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  authenticated = true,
  params?: QueryParams,
  retryCount = 0,
  extractResult = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (API_KEY) headers['x-api-key'] = API_KEY;

  if (authenticated) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && authenticated && retryCount === 0) {
    try {
      const newToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${newToken}`;

      const retryResponse = await fetch(buildUrl(path, params), {
        method,
        headers,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!retryResponse.ok) {
        const payload = await retryResponse.json().catch(() => ({}));
        throw new ApiError(
          retryResponse.status,
          extractErrorMessage(payload, extractResult, retryResponse.status),
        );
      }

      if (retryResponse.status === 204) return undefined as T;
      const retryText = await retryResponse.text();
      if (!retryText) return undefined as T;
      const retryJson = JSON.parse(retryText) as unknown;
      return extractResult ? extractApiResult<T>(retryJson) : (retryJson as T);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Session expirée');
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      extractErrorMessage(payload, extractResult, response.status),
    );
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text) as unknown;
  return extractResult ? extractApiResult<T>(json) : (json as T);
}

// ─── Upload (multipart/form-data) ─────────────────────────────────────────────

async function upload<T>(
  method: 'POST' | 'PUT' | 'PATCH',
  path: string,
  formData: FormData,
  authenticated = true,
  extractResult = false,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (API_KEY) headers['x-api-key'] = API_KEY;

  if (authenticated) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: formData,
  });

  if (response.status === 401 && authenticated) {
    try {
      const newToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${newToken}`;

      const retryResponse = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: formData,
      });

      if (!retryResponse.ok) {
        const payload = await retryResponse.json().catch(() => ({}));
        throw new ApiError(
          retryResponse.status,
          extractErrorMessage(payload, extractResult, retryResponse.status),
        );
      }

      if (retryResponse.status === 204) return undefined as T;
      const retryText = await retryResponse.text();
      if (!retryText) return undefined as T;
      const retryJson = JSON.parse(retryText) as unknown;
      return extractResult ? extractApiResult<T>(retryJson) : (retryJson as T);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, 'Session expirée');
    }
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      extractErrorMessage(payload, extractResult, response.status),
    );
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  const json = JSON.parse(text) as unknown;
  return extractResult ? extractApiResult<T>(json) : (json as T);
}

// ─── Public client ────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, authenticated = true, params?: QueryParams, extractResult = false) =>
    request<T>('GET', path, undefined, authenticated, params, 0, extractResult),

  post: <T>(path: string, body: unknown, authenticated = true, extractResult = false) =>
    request<T>('POST', path, body, authenticated, undefined, 0, extractResult),

  put: <T>(path: string, body: unknown, authenticated = true, extractResult = false) =>
    request<T>('PUT', path, body, authenticated, undefined, 0, extractResult),

  patch: <T>(path: string, body: unknown, authenticated = true, extractResult = false) =>
    request<T>('PATCH', path, body, authenticated, undefined, 0, extractResult),

  delete: <T>(path: string, authenticated = true, extractResult = false) =>
    request<T>('DELETE', path, undefined, authenticated, undefined, 0, extractResult),

  upload: <T>(
    method: 'POST' | 'PUT' | 'PATCH',
    path: string,
    formData: FormData,
    authenticated = true,
    extractResult = false,
  ) => upload<T>(method, path, formData, authenticated, extractResult),
};
