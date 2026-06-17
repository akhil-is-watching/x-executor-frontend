import { ErrorAlert, errorMessage } from "@/components/ErrorAlert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { orgsApi } from "@/lib/hub/api";
import type { Organization } from "@/lib/hub/types";
import { useEffect, useState, type FormEvent } from "react";

type OrgPromptFormProps = {
  token: string;
  orgId: string;
  initialSystemPrompt?: string;
  onSaved?: (org: Organization) => void;
  compact?: boolean;
};

export function OrgPromptForm({
  token,
  orgId,
  initialSystemPrompt = "",
  onSaved,
  compact = false,
}: OrgPromptFormProps) {
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSystemPrompt(initialSystemPrompt);
  }, [initialSystemPrompt]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await orgsApi.updatePrompt(token, orgId, { systemPrompt });
      onSaved?.(updated);
      setSuccess("Prompt saved.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const promptRows = compact ? 4 : 6;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <ErrorAlert error={error} />
      {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System prompt</Label>
        <Textarea
          id="systemPrompt"
          rows={promptRows}
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant for this brand. Answer DMs using only the facts below..."
        />
        <p className="text-xs text-muted-foreground">
          Used by the processor when replying to inbound DMs. Include instructions for out-of-scope
          questions in this prompt. Leave empty to skip automated replies.
        </p>
      </div>
      <Button type="submit" disabled={saving} className="w-fit">
        {saving ? "Saving…" : "Save prompt"}
      </Button>
    </form>
  );
}
