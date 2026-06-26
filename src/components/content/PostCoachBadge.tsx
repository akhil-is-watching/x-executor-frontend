import { cn } from "@/lib/utils";

interface PostCoachBadgeProps {
  score: number;
  verdict?: string;
  size?: "sm" | "md";
}

export function PostCoachBadge({ score, verdict, size = "md" }: PostCoachBadgeProps) {
  const color =
    score >= 60
      ? "text-green-600 border-green-500 bg-green-50"
      : score >= 45
        ? "text-amber-600 border-amber-500 bg-amber-50"
        : "text-red-600 border-red-500 bg-red-50";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        color,
      )}
    >
      <span className="font-bold">{score}</span>
      {verdict && size === "md" && <span className="opacity-75">· {verdict}</span>}
    </span>
  );
}
