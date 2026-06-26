import { PostCoachBadge } from "./PostCoachBadge";
import type { ContentDraft } from "@/lib/content-engine/types";

interface DraftCardProps {
  draft: ContentDraft;
  onEdit: (draft: ContentDraft) => void;
  onDelete: (draftId: string) => void;
  deleting?: boolean;
}

export function DraftCard({ draft, onEdit, onDelete, deleting }: DraftCardProps) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm leading-snug line-clamp-3 whitespace-pre-line">{draft.text}</p>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {draft.score > 0 && <PostCoachBadge score={draft.score} size="sm" />}
        {draft.topic && (
          <span className="rounded-full bg-muted px-2 py-0.5">{draft.topic}</span>
        )}
        {draft.angleType && draft.angleType !== "default" && (
          <span className="rounded-full border border-border px-2 py-0.5 capitalize">
            {draft.angleType}
          </span>
        )}
        {draft.versions.length > 1 && (
          <span className="opacity-60">{draft.versions.length} versions</span>
        )}
        <span className="opacity-60 ml-auto">
          {new Date(draft.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(draft)}
          className="rounded border border-border px-3 py-1 text-xs font-medium hover:bg-muted"
        >
          Edit
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (confirm("Delete this draft?")) onDelete(draft._id);
          }}
          className="rounded border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
