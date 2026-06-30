const CONTENT_ENGINE_URL = (
  process.env.CONTENT_ENGINE_URL ?? "http://localhost:3007"
).replace(/\/$/, "");

export async function proxyToContentEngine(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const target = `${CONTENT_ENGINE_URL}${url.pathname}${url.search}`;
  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = { method: req.method, headers };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  try {
    return await fetch(target, init);
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes("ECONNREFUSED")
        ? `Content Engine is unreachable at ${CONTENT_ENGINE_URL}. Is the service running?`
        : `Content Engine proxy error: ${err instanceof Error ? err.message : String(err)}`;

    return new Response(JSON.stringify({ message, statusCode: 503 }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
