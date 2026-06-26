import { useEffect, useState } from "react";
import { profileApi } from "./api";
import type { ContentProfile } from "./types";

interface State {
  profile: ContentProfile | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const cache: Record<string, ContentProfile | null> = {};

export function useContentProfile(orgId: string): State {
  const [profile, setProfile] = useState<ContentProfile | null>(cache[orgId] ?? null);
  const [loading, setLoading] = useState(!cache[orgId]);
  const [error, setError] = useState<string | null>(null);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    profileApi
      .get(orgId)
      .then((p) => {
        if (!cancelled) {
          cache[orgId] = p;
          setProfile(p);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, rev]);

  return { profile, loading, error, reload: () => setRev((r) => r + 1) };
}
