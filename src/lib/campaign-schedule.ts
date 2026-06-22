export type CampaignScheduleDay = {
  dayOfWeek: number;
  enabled: boolean;
  startMinute: number;
  endMinute: number;
};

export const CAMPAIGN_DAY_SHORT_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export const CAMPAIGN_DAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function createDefaultCampaignSchedule(): CampaignScheduleDay[] {
  return CAMPAIGN_DAY_LABELS.map((_, dayOfWeek) => ({
    dayOfWeek,
    enabled: true,
    startMinute: 0,
    endMinute: 1440,
  }));
}

export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function listSupportedTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
}

export function formatTimezoneLabel(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find(part => part.type === "timeZoneName")?.value ?? "";
    return offset ? `${timezone} (${offset})` : timezone;
  } catch {
    return timezone;
  }
}

export function minuteToTimeOption(minute: number): string {
  if (minute >= 1440) return "24:00";
  const hours = Math.floor(minute / 60);
  const minutes = minute % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

export function parseTimeOption(value: string): number {
  if (value === "24:00") return 1440;
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number.parseInt(hoursRaw ?? "0", 10);
  const minutes = Number.parseInt(minutesRaw ?? "0", 10);
  return hours * 60 + minutes;
}

export const TIME_OPTIONS = Array.from({ length: 25 }, (_, hour) =>
  hour === 24 ? "24:00" : `${hour}:00`,
);

export function formatSendInterval(dmsPerHour: number): string {
  if (dmsPerHour <= 0) return "";
  const minutes = 60 / dmsPerHour;
  if (minutes >= 1) {
    const rounded = Math.max(1, Math.round(minutes));
    return `~1 DM every ${rounded} min`;
  }
  const seconds = Math.max(1, Math.round(minutes * 60));
  return `~1 DM every ${seconds} sec`;
}

export function validateCampaignSchedule(schedule: CampaignScheduleDay[]): string | null {
  const enabled = schedule.filter(day => day.enabled);
  if (enabled.length === 0) {
    return "Enable at least one day in the schedule.";
  }
  for (const day of enabled) {
    if (day.startMinute >= day.endMinute) {
      return `${CAMPAIGN_DAY_LABELS[day.dayOfWeek]}: start time must be before end time.`;
    }
  }
  return null;
}
