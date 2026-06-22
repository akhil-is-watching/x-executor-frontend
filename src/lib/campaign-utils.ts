export function parseTargetUsernames(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]+/)
        .map(u => u.trim().replace(/^@/, "").toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export function formatRelativeEta(expectedEndAt: string | undefined): string | null {
  if (!expectedEndAt) return null;
  const ms = new Date(expectedEndAt).getTime() - Date.now();
  if (ms <= 0) return "Any moment now";
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) return `~${minutes} min remaining`;
  const hours = Math.ceil(minutes / 60);
  return `~${hours} hr remaining`;
}

export function isCampaignActive(status: string): boolean {
  return status === "pending" || status === "running" || status === "paused";
}

export function isCampaignPolling(status: string, syncStatus?: string): boolean {
  return (
    isCampaignActive(status) ||
    status === "syncing" ||
    syncStatus === "syncing"
  );
}

export function canStopCampaign(status: string): boolean {
  return ["pending", "running", "paused", "draft", "syncing"].includes(status);
}

export function formatCampaignAudienceLabel(campaign: {
  audienceType?: string;
  targetUsername?: string;
  totalTargets: number;
  syncedFollowerCount?: number;
  status: string;
}): string | null {
  if (campaign.audienceType === "followers") {
    const target = campaign.targetUsername ? `@${campaign.targetUsername}` : "target account";
    if (campaign.status === "syncing") {
      const synced = campaign.syncedFollowerCount ?? 0;
      return `Followers of ${target} · syncing (${synced} so far)`;
    }
    if (campaign.status === "draft") {
      return `Followers of ${target} · select recipients to start`;
    }
    return `Followers of ${target}`;
  }
  if (campaign.totalTargets > 0) {
    return `${campaign.totalTargets} manual target(s)`;
  }
  return null;
}

export function formatCampaignProgressLabel(campaign: {
  status: string;
  totalTargets: number;
  messagesSent: number;
  failedCount: number;
  progressPercent: number;
}): string {
  if (campaign.status === "syncing") {
    return "Syncing followers…";
  }
  if (campaign.status === "draft") {
    return "Awaiting start";
  }
  const processed = campaign.messagesSent + campaign.failedCount;
  return `${processed} of ${campaign.totalTargets} processed · ${campaign.progressPercent}% complete`;
}
