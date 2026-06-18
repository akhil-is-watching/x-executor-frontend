import { API_PREFIX } from "./constants";

export { API_PREFIX };

export class HubApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "HubApiError";
  }
}

function apiBase(): string {
  return (import.meta.env.PUBLIC_HUB_API_URL ?? "").replace(/\/$/, "");
}

export function hubPublicBaseUrl(): string {
  return (import.meta.env.PUBLIC_HUB_PUBLIC_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function validateAbsoluteHubUrl(url: string, envName: string): string | null {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "http:" && protocol !== "https:") {
      return `${envName} must use http or https.`;
    }
    if (!hostname) {
      return `${envName} is missing a hostname (e.g. https://your-hub.up.railway.app).`;
    }
    return null;
  } catch {
    return `${envName} is not a valid URL.`;
  }
}

export function validateHubPublicBaseUrl(): string | null {
  return validateAbsoluteHubUrl(hubPublicBaseUrl(), "PUBLIC_HUB_PUBLIC_BASE_URL");
}

/** Empty api base is OK on localhost (Bun dev proxy). On Vercel use `/api/hub` rewrite or set PUBLIC_HUB_API_URL. */
export function validateHubApiUrl(): string | null {
  const base = apiBase();
  if (base) {
    return validateAbsoluteHubUrl(base, "PUBLIC_HUB_API_URL");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return null;
    }
  }
  return "Set PUBLIC_HUB_API_URL at build time, or configure a Vercel rewrite for /api/hub → Hub.";
}

export function oauthStartUrl(inviteToken: string): string {
  const query = `?invite=${encodeURIComponent(inviteToken)}`;
  const origin = apiBase() || hubPublicBaseUrl();
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (!apiBase() && (hostname === "localhost" || hostname === "127.0.0.1")) {
      return `${API_PREFIX}/oauth/x/start${query}`;
    }
  }
  return `${origin}${API_PREFIX}/oauth/x/start${query}`;
}

export async function hubFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${apiBase()}${API_PREFIX}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const hint = apiBase()
      ? "Hub returned a non-JSON response. Check that the Hub service is running."
      : validateHubApiUrl() ?? "API requests are misconfigured for this deployment.";
    throw new HubApiError(hint, res.status);
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? res.statusText);
    throw new HubApiError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
