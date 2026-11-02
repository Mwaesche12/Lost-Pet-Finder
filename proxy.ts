// Password gate for the private preview (HTTP Basic auth). Set SITE_PASSWORD in Vercel.
// Remove (or unset PREVIEW_GATE) when the site goes public.
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (process.env.PREVIEW_GATE !== "on") return NextResponse.next();
  const password = process.env.SITE_PASSWORD;
  if (!password) return new NextResponse("Site password not configured", { status: 503 });
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return NextResponse.next();
  }
  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Lost Pet Finder (private preview)"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
