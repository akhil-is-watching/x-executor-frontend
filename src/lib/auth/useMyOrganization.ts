import { orgsApi } from "@/lib/hub/api";
import type { OrganizationWithRole } from "@/lib/hub/types";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";

export function useMyOrganization(): {
  org: OrganizationWithRole | null;
  loading: boolean;
} {
  const { token } = useAuth();
  const [org, setOrg] = useState<OrganizationWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setOrg(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    orgsApi
      .list(token)
      .then(orgs => setOrg(orgs[0] ?? null))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }, [token]);

  return { org, loading };
}
