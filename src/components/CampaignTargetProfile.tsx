type CampaignTargetProfileProps = {
  targetUsername?: string;
  targetDisplayName?: string;
  targetProfilePictureUrl?: string;
  size?: "sm" | "md";
  prefix?: string;
};

export function CampaignTargetProfile({
  targetUsername,
  targetDisplayName,
  targetProfilePictureUrl,
  size = "md",
  prefix = "Followers of",
}: CampaignTargetProfileProps) {
  if (!targetUsername) {
    return null;
  }

  const avatarClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  const titleClass = size === "sm" ? "text-sm font-medium" : "text-base font-medium";

  return (
    <div className="flex items-center gap-3">
      {targetProfilePictureUrl ? (
        <img
          src={targetProfilePictureUrl}
          alt=""
          className={`${avatarClass} rounded-full object-cover bg-muted shrink-0`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={`${avatarClass} flex items-center justify-center rounded-full bg-muted font-medium uppercase shrink-0`}
        >
          {targetUsername.slice(0, 1)}
        </div>
      )}
      <div className="min-w-0">
        {targetDisplayName && (
          <p className={`${titleClass} truncate`}>{targetDisplayName}</p>
        )}
        <p className="text-sm text-muted-foreground truncate">
          {prefix} @{targetUsername}
        </p>
      </div>
    </div>
  );
}
