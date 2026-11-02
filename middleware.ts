// Password gate for the prototype (HTTP Basic auth). Set SITE_PASSWORD in Vercel project settings.
export const config = { matcher: "/:path*" };

export default function middleware(request: Request) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return new Response("Site password not configured", { status: 503 });
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return;
  }
  return new Response("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Lost Pet Finder (private preview)"' },
  });
}
