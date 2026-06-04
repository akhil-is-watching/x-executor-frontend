import { ErrorAlert, errorMessage } from "@/components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { invitesApi } from "@/lib/hub/api";
import { oauthStartUrl, validateHubPublicBaseUrl } from "@/lib/hub/client";
import { getOAuthSuccess } from "@/lib/oauth-session";
import type { InvitePublic } from "@/lib/hub/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function ConnectPage() {
  const { token } = useParams<{ token: string }>();
  const [meta, setMeta] = useState<InvitePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    invitesApi
      .getPublic(token)
      .then(setMeta)
      .catch(err => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [token]);

  const invalid =
    meta && (meta.expired || meta.revoked || meta.maxUsesReached);

  const hubConfigError = validateHubPublicBaseUrl();
  const recentSuccess = token ? getOAuthSuccess(token) : null;

  function handleConnect() {
    if (!token || hubConfigError) return;
    window.location.href = oauthStartUrl(token);
  }

  if (loading) {
    return <p className="text-muted-foreground text-center">Loading invite…</p>;
  }

  if (error && !meta) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid invite</CardTitle>
          <CardDescription>This invite link is not valid.</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorAlert error={error} />
        </CardContent>
      </Card>
    );
  }

  if (recentSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Already connected</CardTitle>
          <CardDescription>
            {meta ? orgLabel(meta.orgName) : "This invite was used successfully."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">@{recentSuccess.xUsername}</strong> was linked on this device.
            You do not need to authorize again.
          </p>
          <p>You can close this tab. Admins verify the connection in the dashboard under Connections.</p>
        </CardContent>
      </Card>
    );
  }

  if (invalid && meta) {
    const usedSuccessfully =
      meta.maxUsesReached && (meta.useCount ?? 0) > 0 && !meta.expired && !meta.revoked;

    if (usedSuccessfully) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Connection complete</CardTitle>
            <CardDescription>{orgLabel(meta.orgName)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              An X account was already authorized through this invite. You do not need to connect again
              unless your admin gave you a new invite link.
            </p>
            <p>
              Admins can confirm the linked account under <strong className="text-foreground">Connections</strong>{" "}
              in the dashboard.
            </p>
          </CardContent>
        </Card>
      );
    }

    const reason = meta.revoked
      ? "This invite has been revoked."
      : meta.expired
        ? "This invite has expired."
        : "This invite has reached its maximum number of uses.";
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cannot connect</CardTitle>
          <CardDescription>{orgLabel(meta.orgName)}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{reason}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect your X account</CardTitle>
        <CardDescription>
          {meta ? orgLabel(meta.orgName) : "Authorize access for this organization."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorAlert error={hubConfigError ?? error} />
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground space-y-2">
          <p>
            <strong className="text-foreground">Already logged into X?</strong> That only means you are signed in
            at x.com. You still need to tap the button below and <strong className="text-foreground">authorize this
            app</strong> on the X screen (Approve / Authorize).
          </p>
          <p>Each invite links one X account to this organization. No dashboard login is required.</p>
        </div>
        <Button className="w-full" size="lg" onClick={handleConnect} disabled={Boolean(hubConfigError)}>
          Authorize with X
        </Button>
      </CardContent>
    </Card>
  );
}

function orgLabel(name: string) {
  return <>You are connecting to <strong>{name}</strong>.</>;
}
