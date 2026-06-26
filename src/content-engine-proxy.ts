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

  return fetch(target, init);
}
