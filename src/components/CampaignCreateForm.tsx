import { ErrorAlert, errorMessage } from "@/components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseTargetUsernames } from "@/lib/campaign-utils";
import { campaignsApi } from "@/lib/hub/api";
import type { Connection } from "@/lib/hub/types";
import { useState, type FormEvent } from "react";

const DMS_PER_HOUR_OPTIONS = [5, 10, 15, 20, 25, 30] as const;

type CampaignCreateFormProps = {
  token: string;
  orgId: string;
  connections: Connection[];
  onCreated: (campaignId: string) => void;
};

export function CampaignCreateForm({ token, orgId, connections, onCreated }: CampaignCreateFormProps) {
  const [name, setName] = useState("");
  const [targetsRaw, setTargetsRaw] = useState("");
  const [messageText, setMessageText] = useState("");
  const [dmsPerHour, setDmsPerHour] = useState<string>("15");
  const [accountsToUse, setAccountsToUse] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedTargets = parseTargetUsernames(targetsRaw);
  const eligibleConnections = connections.filter(c => c.hasAuthToken);
  const authTokenCount = eligibleConnections.length;
  const hasAuthToken = authTokenCount > 0;
  const selectedRate = Number.parseInt(dmsPerHour, 10);
  const selectedAccountCount = Number.parseInt(
    accountsToUse || String(authTokenCount),
    10,
  );
  const canSubmit =
    name.trim().length > 0 &&
    parsedTargets.length > 0 &&
    messageText.trim().length > 0 &&
    hasAuthToken &&
    !submitting &&
    Number.isFinite(selectedRate) &&
    Number.isFinite(selectedAccountCount) &&
    selectedAccountCount >= 1 &&
    selectedAccountCount <= authTokenCount;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await campaignsApi.create(token, orgId, {
        name: name.trim(),
        targetUsernames: parsedTargets,
        messageText: messageText.trim(),
        dmsPerHour: selectedRate,
        accountsToUse: selectedAccountCount,
      });
      onCreated(result.id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ErrorAlert error={error} />

      <div className="space-y-2">
        <Label htmlFor="campaignName">Campaign name</Label>
        <Input
          id="campaignName"
          placeholder="Q1 outreach"
          maxLength={100}
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="targets">Target usernames</Label>
        <Textarea
          id="targets"
          placeholder={"alice\n@bob\ncharlie"}
          rows={6}
          value={targetsRaw}
          onChange={e => setTargetsRaw(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          One username per line or comma-separated. @ prefixes are optional.{" "}
          {parsedTargets.length > 0 && (
            <span className="text-foreground">{parsedTargets.length} unique target(s)</span>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Hi — we're reaching out from Acme."
          rows={4}
          value={messageText}
          onChange={e => setMessageText(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountsToUse">Accounts to use</Label>
        <Select
          value={accountsToUse || String(authTokenCount)}
          onValueChange={setAccountsToUse}
          disabled={!hasAuthToken}
        >
          <SelectTrigger id="accountsToUse" className="max-w-xs">
            <SelectValue placeholder="Select account count" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: authTokenCount }, (_, index) => index + 1).map(
              count => (
                <SelectItem key={count} value={String(count)}>
                  {count === authTokenCount
                    ? `All ${count} account(s)`
                    : `${count} account${count === 1 ? "" : "s"}`}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {hasAuthToken ? (
            <>
              Eligible senders:{" "}
              {eligibleConnections.map(c => `@${c.xUsername}`).join(", ")}. The
              least-loaded accounts are chosen at launch.
            </>
          ) : (
            "Connect at least one account with an auth token before launching."
          )}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dmsPerHour">Send rate (per account)</Label>
        <Select value={dmsPerHour} onValueChange={setDmsPerHour}>
          <SelectTrigger id="dmsPerHour" className="max-w-xs">
            <SelectValue placeholder="Select DMs per hour" />
          </SelectTrigger>
          <SelectContent>
            {DMS_PER_HOUR_OPTIONS.map(option => (
              <SelectItem key={option} value={String(option)}>
                {option} DMs / hour per account
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Estimated org throughput:{" "}
          <span className="text-foreground">
            {selectedRate * selectedAccountCount} DMs / hour
          </span>{" "}
          across {selectedAccountCount} account(s).
        </p>
      </div>

      <Button type="submit" disabled={!canSubmit}>
        {submitting ? "Creating…" : "Launch campaign"}
      </Button>
    </form>
  );
}
