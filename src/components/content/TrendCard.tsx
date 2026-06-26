import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrendTopic, ProductTrendTopic } from "@/lib/content-engine/types";

type TrendMeta = {
  sentiment?: string;
  trendSummary?: string;
  dataPoints?: { fact: string; source?: string }[];
};

interface IndustryTrendCardProps {
  topic: TrendTopic;
  onSelectAngle: (angle: string, angleType: "product" | "authentic", title: string, meta?: TrendMeta) => void;
}

export function IndustryTrendCard({ topic, onSelectAngle }: IndustryTrendCardProps) {
  const [expanded, setExpanded] = useState(false);

  const meta: TrendMeta = { sentiment: topic.sentiment, trendSummary: topic.summary };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div
        className="cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((ex) => !ex)}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium leading-snug">{topic.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            {topic.sentiment && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  topic.sentiment === "bullish"
                    ? "bg-green-100 text-green-700"
                    : topic.sentiment === "bearish"
                      ? "bg-red-100 text-red-700"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {topic.sentiment}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{topic.summary}</p>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-border">
          {topic.companyAngles.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Product angles
              </p>
              {topic.companyAngles.map((angle, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
                >
                  <p className="text-xs flex-1">{angle}</p>
                  <button
                    type="button"
                    onClick={() => onSelectAngle(angle, "product", topic.title, meta)}
                    className="shrink-0 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Write this
                  </button>
                </div>
              ))}
            </div>
          )}
          {topic.authenticAngle && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Authentic angle
              </p>
              <div className="flex items-start justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
                <p className="text-xs flex-1">{topic.authenticAngle}</p>
                <button
                  type="button"
                  onClick={() => onSelectAngle(topic.authenticAngle!, "authentic", topic.title, meta)}
                  className="shrink-0 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Write this
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ProductTrendCardProps {
  topic: ProductTrendTopic;
  onSelectAngle: (angle: string, angleType: "founder", title: string, meta?: TrendMeta) => void;
}

export function ProductTrendCard({ topic, onSelectAngle }: ProductTrendCardProps) {
  const [expanded, setExpanded] = useState(false);

  const meta: TrendMeta = { trendSummary: topic.summary, dataPoints: topic.dataPoints };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div
        className="cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((ex) => !ex)}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-medium leading-snug">{topic.title}</h3>
          <span className="text-xs text-muted-foreground">{expanded ? "▲" : "▼"}</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{topic.summary}</p>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1 border-t border-border">
          {topic.dataPoints.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                Data points
              </p>
              <ul className="space-y-1">
                {topic.dataPoints.map((dp, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-primary mt-0.5">·</span>
                    {dp.fact}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-start justify-between gap-3 rounded-md bg-muted/40 px-3 py-2">
            <p className="text-xs flex-1">{topic.founderAngle}</p>
            <button
              type="button"
              onClick={() => onSelectAngle(topic.founderAngle, "founder", topic.title, meta)}
              className="shrink-0 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Write this
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
