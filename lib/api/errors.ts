import { NextResponse } from "next/server";

export interface ApiError {
  error: string;
  details?: unknown;
}

/**
 * Standardized error response helper
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  const response: ApiError = { error: message };
  if (details) {
    response.details = details;
  }
  return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const ApiErrors = {
  unauthorized: () => errorResponse("Unauthorized", 401),
  forbidden: (message: string = "Insufficient permissions") =>
    errorResponse(message, 403),
  notFound: (resource: string = "Resource") =>
    errorResponse(`${resource} not found`, 404),
  badRequest: (message: string = "Bad request") =>
    errorResponse(message, 400),
  internalError: (message: string = "Internal server error") =>
    errorResponse(message, 500),
  missingFields: (fields?: string[]) =>
    errorResponse(
      fields
        ? `Missing required fields: ${fields.join(", ")}`
        : "Missing required fields",
      400
    ),
  invalidFormat: (field: string, format: string) =>
    errorResponse(`Invalid ${field} format. ${format}`, 400),
};

/**
 * Handle API route errors consistently
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const logContext = context ? `[${context}]` : "";
  
  // Log error (in production, use proper logging service)
  if (process.env.NODE_ENV === "development") {
    console.error(`${logContext}`, error);
  }

  return ApiErrors.internalError(
    process.env.NODE_ENV === "development" ? errorMessage : "Internal server error"
  );
}

