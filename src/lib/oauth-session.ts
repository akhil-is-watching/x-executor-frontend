const STORAGE_KEY = "x_executor_oauth_success";

export type OAuthSuccessRecord = {
  inviteToken: string;
  xUsername: string;
  at: number;
};

export function saveOAuthSuccess(inviteToken: string, xUsername: string): void {
  const record: OAuthSuccessRecord = { inviteToken, xUsername, at: Date.now() };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function getOAuthSuccess(inviteToken: string): OAuthSuccessRecord | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw) as OAuthSuccessRecord;
    if (record.inviteToken !== inviteToken) return null;
    // Valid for 24h (covers returning to the same invite link)
    if (Date.now() - record.at > 24 * 60 * 60 * 1000) return null;
    return record;
  } catch {
    return null;
  }
}
