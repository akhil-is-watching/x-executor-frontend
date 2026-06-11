import {
  FRONTEND_HUB_API_PREFIX,
  HUB_BACKEND_API_PREFIX,
} from "./lib/hub/constants";

const HUB_API_URL = (process.env.HUB_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function proxyToHub(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const frontendPrefix = `/${FRONTEND_HUB_API_PREFIX}`;
  const backendPrefix = `/${HUB_BACKEND_API_PREFIX}`;

  let pathname = url.pathname;
  if (pathname.startsWith(`${frontendPrefix}/`) || pathname === frontendPrefix) {
    pathname = `${backendPrefix}${pathname.slice(frontendPrefix.length)}`;
  }

  const target = `${HUB_API_URL}${pathname}${url.search}`;
  const headers = new Headers(req.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
  }

  return fetch(target, init);
}
