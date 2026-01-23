// 🎸 API Response Types
// Type Definitionen für API Responses

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper Type Guards
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

export function isApiError(
  response: ApiResponse<any>
): response is ApiErrorResponse {
  return response.success === false;
}
