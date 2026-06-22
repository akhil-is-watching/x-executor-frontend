import { ErrorAlert, errorMessage } from "@/components/ErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { campaignsApi } from "@/lib/hub/api";
import type { CampaignFollower, CampaignStatusResponse } from "@/lib/hub/types";
import { useCallback, useEffect, useState } from "react";

type CampaignFollowerAudienceProps = {
  token: string;
  campaignId: string;
  campaign: CampaignStatusResponse;
  admin: boolean;
  onCampaignUpdated: () => void;
};

const PAGE_SIZE = 50;

export function CampaignFollowerAudience({
  token,
  campaignId,
  campaign,
  admin,
  onCampaignUpdated,
}: CampaignFollowerAudienceProps) {
  const [followers, setFollowers] = useState<CampaignFollower[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [canDmOnly, setCanDmOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);

  const syncComplete = campaign.syncStatus === "completed";
  const canSelect = admin && syncComplete && campaign.status === "draft";

  const loadFollowers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [result, selectedResult] = await Promise.all([
        campaignsApi.listFollowers(token, campaignId, {
          page,
          limit: PAGE_SIZE,
          canDm: canDmOnly ? true : undefined,
          q: search.trim() || undefined,
        }),
        canSelect
          ? campaignsApi.listFollowers(token, campaignId, {
              page: 1,
              limit: 1,
              selected: true,
              canDm: true,
            })
          : Promise.resolve(null),
      ]);
      setFollowers(result.data);
      setTotal(result.total);
      if (selectedResult) {
        setSelectedTotal(selectedResult.total);
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, campaignId, page, canDmOnly, search, canSelect]);

  useEffect(() => {
    loadFollowers();
  }, [loadFollowers]);

  useEffect(() => {
    if (campaign.status !== "syncing" && campaign.syncStatus !== "syncing") return;
    const id = setInterval(onCampaignUpdated, 10_000);
    return () => clearInterval(id);
  }, [campaign.status, campaign.syncStatus, onCampaignUpdated]);

  async function toggleSelection(follower: CampaignFollower) {
    if (!canSelect) return;
    setActionError(null);
    setBusy(true);
    try {
      await campaignsApi.updateFollowerSelection(token, campaignId, {
        followerIds: [follower.id],
        selected: !follower.selected,
      });
      await loadFollowers();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function fetchAllFollowerIds(onlyCanDm: boolean): Promise<string[]> {
    const ids: string[] = [];
    let currentPage = 1;
    while (true) {
      const result = await campaignsApi.listFollowers(token, campaignId, {
        page: currentPage,
        limit: 200,
        canDm: onlyCanDm ? true : undefined,
        q: search.trim() || undefined,
      });
      ids.push(...result.data.map(follower => follower.id));
      if (currentPage * 200 >= result.total) break;
      currentPage += 1;
    }
    return ids;
  }

  async function bulkSelect(selected: boolean, onlyCanDm = false) {
    if (!canSelect) return;
    setActionError(null);
    setBusy(true);
    try {
      const ids = await fetchAllFollowerIds(onlyCanDm);
      if (ids.length === 0) return;

      const chunkSize = 200;
      for (let index = 0; index < ids.length; index += chunkSize) {
        await campaignsApi.updateFollowerSelection(token, campaignId, {
          followerIds: ids.slice(index, index + chunkSize),
          selected,
        });
      }
      await loadFollowers();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleStart() {
    if (!admin || campaign.status !== "draft" || !syncComplete) return;
    setActionError(null);
    setStarting(true);
    try {
      await campaignsApi.start(token, campaignId);
      onCampaignUpdated();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setStarting(false);
    }
  }

  const selectedOnPage = followers.filter(f => f.selected).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Follower audience</CardTitle>
        <CardDescription>
          {campaign.targetUsername ? `@${campaign.targetUsername}` : "Target account"} ·{" "}
          {campaign.syncedFollowerCount ?? 0} synced · {campaign.canDmFollowerCount ?? 0} can DM
          {canSelect && selectedTotal > 0 ? ` · ${selectedTotal} selected` : ""}
          {campaign.status === "syncing" || campaign.syncStatus === "syncing"
            ? " · syncing followers…"
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaign.syncError && (
          <p className="text-sm text-destructive">Sync failed: {campaign.syncError}</p>
        )}

        <ErrorAlert error={error} />
        <ErrorAlert error={actionError} />

        {canSelect && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => bulkSelect(true, true)}
            >
              Select all can DM
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => bulkSelect(false)}
            >
              Clear selection
            </Button>
            <Button type="button" size="sm" disabled={starting || selectedTotal === 0} onClick={handleStart}>
              {starting ? "Starting…" : "Start campaign"}
            </Button>
            {selectedTotal === 0 && (
              <span className="text-xs text-muted-foreground">
                Select at least one follower who can receive DMs.
              </span>
            )}
          </div>
        )}

        {!canSelect && syncComplete && campaign.status === "draft" && !admin && (
          <p className="text-sm text-muted-foreground">
            An admin must select followers and start this campaign.
          </p>
        )}

        {(canSelect || total > 0) && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="Search followers"
                value={search}
                onChange={e => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="max-w-xs"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={canDmOnly}
                  onChange={e => {
                    setPage(1);
                    setCanDmOnly(e.target.checked);
                  }}
                />
                Can DM only
              </label>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading followers…</p>
            ) : followers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No followers match your filters.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      {canSelect && <th className="px-3 py-2">Select</th>}
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Can DM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {followers.map(follower => (
                      <tr key={follower.id} className="border-t border-border">
                        {canSelect && (
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={follower.selected}
                              disabled={busy || !follower.canDm}
                              onChange={() => toggleSelection(follower)}
                            />
                          </td>
                        )}
                        <td className="px-3 py-2 font-mono">@{follower.userName}</td>
                        <td className="px-3 py-2">{follower.name}</td>
                        <td className="px-3 py-2">
                          {follower.canDm ? (
                            <Badge variant="outline">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Page {page} · {total} total
                {canSelect ? ` · ${selectedOnPage} selected on this page` : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(current => current - 1)}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={page * PAGE_SIZE >= total || loading}
                  onClick={() => setPage(current => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {canSelect && (
          <p className="text-xs text-muted-foreground">
            Start sends only to selected followers with can DM enabled (max ~800 synced per target).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
