import type { CoachResult } from "@/lib/content-engine/types";
import { PostCoachBadge } from "./PostCoachBadge";
import { cn } from "@/lib/utils";

interface PostCoachPanelProps {
  result: CoachResult | null;
  loading?: boolean;
}

const STATUS_ICON: Record<string, string> = {
  pass: "✓",
  nudge: "⚠",
  flag: "✗",
};

const STATUS_COLOR: Record<string, string> = {
  pass: "text-green-600",
  nudge: "text-amber-600",
  flag: "text-red-600",
};

export function PostCoachPanel({ result, loading }: PostCoachPanelProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Generate or type a tweet to see the Post Coach score.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Post Coach</span>
        <PostCoachBadge score={result.score} verdict={result.verdict} />
      </div>

      <p className="text-sm text-muted-foreground">{result.summary}</p>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="text-red-600 font-medium">{result.stats.flagged} flagged</span>
        <span className="text-amber-600 font-medium">{result.stats.nudges} nudges</span>
        <span className="text-green-600 font-medium">{result.stats.onPoint} on point</span>
      </div>

      <div className="space-y-1.5">
        {result.checks.map((check) => (
          <div key={check.id} className="flex items-start gap-2 text-xs">
            <span className={cn("mt-0.5 font-bold", STATUS_COLOR[check.status])}>
              {STATUS_ICON[check.status]}
            </span>
            <div>
              <span className="text-foreground">{check.label}</span>
              {check.hint && (
                <p className="text-muted-foreground mt-0.5">{check.hint}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        {result.wordCount} words · {result.charCount}/280 chars
      </div>
    </div>
  );
}
