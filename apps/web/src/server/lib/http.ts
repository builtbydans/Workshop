import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { AppError, ERROR_CODES } from "../errors/AppError";

export function json<T>(status: number, data: T) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonMessage(status: number, message: string) {
  return NextResponse.json({ success: true, message }, { status });
}

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError(
      "Validation failed",
      400,
      ERROR_CODES.VALIDATION_ERROR,
      { body: ["Invalid JSON body"] },
    );
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const details: Record<string, string[]> = {};

    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "body";
      if (!details[key]) details[key] = [];
      details[key].push(issue.message);
    }

    throw new AppError(
      "Validation failed",
      400,
      ERROR_CODES.VALIDATION_ERROR,
      details,
    );
  }

  return result.data;
}

export function toErrorResponse(error: unknown) {
  const isProduction = process.env.NODE_ENV === "production";

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
        ...(!isProduction && { stack: error.stack }),
      },
      { status: error.statusCode },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message:
        !isProduction && error instanceof Error
          ? error.message
          : "An unexpected error occurred",
      ...(!isProduction &&
        error instanceof Error && {
          stack: error.stack,
        }),
    },
    { status: 500 },
  );
}

export async function handleRoute(
  run: () => Promise<NextResponse> | NextResponse,
) {
  try {
    return await run();
  } catch (error) {
    return toErrorResponse(error);
  }
}
