// 🎸 API Service Layer
// Zentrale API-Kommunikation

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * API Error Klasse
 */
export class ApiError extends Error {
  constructor(message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Baut Query-String aus Parametern
 */
function buildQueryString(
  params: Record<string, string | number | boolean>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
}

/**
 * Zentrale Fetch-Wrapper Funktion
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // URL mit Query-Parametern bauen
  let url = endpoint;
  if (params) {
    const queryString = buildQueryString(params);
    url += `?${queryString}`;
  }

  // Default Headers
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Response Body parsen
    let data;
    const contentType = response.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Fehler werfen bei nicht-OK Status
    if (!response.ok) {
      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network Error
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

/**
 * GET Request
 */
export async function get<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "GET",
  });
}

/**
 * POST Request
 */
export async function post<T>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT Request
 */
export async function put<T>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PATCH Request
 */
export async function patch<T>(
  endpoint: string,
  data?: any,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE Request
 */
export async function del<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  return request<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
}
