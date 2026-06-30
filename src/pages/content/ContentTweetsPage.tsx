import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { tweetsApi } from "@/lib/content-engine/api";
import { useContentProfile } from "@/lib/content-engine/useContentProfile";
import { PostCoachBadge } from "@/components/content/PostCoachBadge";
import type { ContentDraft } from "@/lib/content-engine/types";
import { ErrorAlert } from "@/components/ErrorAlert";

const PAGE_SIZE = 20;

export function ContentTweetsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { profile } = useContentProfile(orgId!);

  const [tweets, setTweets] = useState<ContentDraft[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    tweetsApi
      .list(orgId, 1, PAGE_SIZE)
      .then((res) => {
        setTweets(res.tweets);
        setTotal(res.total);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [orgId]);

  async function loadMore() {
    if (!orgId) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await tweetsApi.list(orgId, nextPage, PAGE_SIZE);
      setTweets((prev) => [...prev, ...res.tweets]);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingMore(false);
    }
  }

  if (profile && !profile.onboardingComplete) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Set up your content profile first.</p>
        <Link to={`/orgs/${orgId}/content/profile`} className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Published Tweets</h1>
        {!loading && (
          <p className="text-sm text-muted-foreground">{total} tweet{total !== 1 ? "s" : ""} published</p>
        )}
      </div>

      {error && <ErrorAlert error={error} />}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg border border-border bg-muted/20" />
          ))}
        </div>
      ) : tweets.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No published tweets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <div key={tweet._id} className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm leading-relaxed whitespace-pre-line">{tweet.text}</p>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {tweet.score > 0 && <PostCoachBadge score={tweet.score} size="sm" />}
                {tweet.topic && (
                  <span className="rounded-full bg-muted px-2 py-0.5">{tweet.topic}</span>
                )}
                {tweet.postedAt && (
                  <span className="opacity-60">
                    {new Date(tweet.postedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {tweet.xTweetId && (
                  <a
                    href={`https://x.com/i/web/status/${tweet.xTweetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-primary hover:underline underline-offset-2"
                  >
                    View on X ↗
                  </a>
                )}
              </div>
            </div>
          ))}

          {tweets.length < total && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={loadMore}
              className="w-full rounded-lg border border-border py-2.5 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : `Load more (${total - tweets.length} remaining)`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
