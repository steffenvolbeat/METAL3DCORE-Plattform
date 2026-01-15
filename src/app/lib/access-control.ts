// src/lib/access-control.ts
import { NextResponse } from "next/server";

export const ACCESS_COMING_SOON_PATHS = ["/admin", "/api/admin", "/coming-soon"];

export function markAccessControl(response: NextResponse, pathname: string) {
  const hit = ACCESS_COMING_SOON_PATHS.some(p => pathname.startsWith(p));
  if (hit) {
    response.headers.set("X-Access-Control-Mode", "coming-soon");
    response.headers.set("X-Access-Control-Role", "not-enforced");
  }
  return response;
}
