import { handleRoute } from "@/server/lib/http";
import { NextResponse } from "next/server";

export async function GET() {
  return handleRoute(async () => {
    return NextResponse.json({
      status: "ok",
      service: "workshop-api",
      timestamp: new Date().toISOString(),
    });
  });
}
