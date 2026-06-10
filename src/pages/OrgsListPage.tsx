import { ErrorAlert, errorMessage } from "@/components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/AuthContext";
import { orgsApi } from "@/lib/hub/api";
import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

export function OrgsListPage() {
  const { token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    orgsApi
      .list(token)
      .then(orgs => setOrgId(orgs[0]?.id ?? null))
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [token]);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const slug = (form.get("slug") as string)?.trim();
    setError(null);
    setCreating(true);
    try {
      const org = await orgsApi.create(token, {
        name: form.get("name") as string,
        ...(slug ? { slug } : {}),
      });
      await refreshUser();
      setOrgId(org.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  if (orgId) {
    return <Navigate to={`/orgs/${orgId}`} replace />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Set up your organization</h1>
        <p className="text-muted-foreground">
          Each account gets one organization for X connections, invites, and campaigns.
        </p>
      </div>

      <ErrorAlert error={error} />

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Create organization</CardTitle>
          <CardDescription>You can only create one organization per account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" name="slug" placeholder="acme-corp" />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
