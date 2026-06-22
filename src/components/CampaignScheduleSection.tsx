import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAMPAIGN_DAY_LABELS,
  CAMPAIGN_DAY_SHORT_LABELS,
  TIME_OPTIONS,
  formatSendInterval,
  formatTimezoneLabel,
  listSupportedTimezones,
  minuteToTimeOption,
  parseTimeOption,
  type CampaignScheduleDay,
} from "@/lib/campaign-schedule";
import { useMemo } from "react";

type CampaignScheduleSectionProps = {
  dmsPerHour: number;
  dailyLimitPerAccount: number;
  timezone: string;
  schedule: CampaignScheduleDay[];
  onDmsPerHourChange: (value: number) => void;
  onDailyLimitChange: (value: number) => void;
  onTimezoneChange: (value: string) => void;
  onScheduleChange: (schedule: CampaignScheduleDay[]) => void;
};

export function CampaignScheduleSection({
  dmsPerHour,
  dailyLimitPerAccount,
  timezone,
  schedule,
  onDmsPerHourChange,
  onDailyLimitChange,
  onTimezoneChange,
  onScheduleChange,
}: CampaignScheduleSectionProps) {
  const timezones = useMemo(() => listSupportedTimezones(), []);

  function updateDay(dayOfWeek: number, patch: Partial<CampaignScheduleDay>) {
    onScheduleChange(
      schedule.map(day => (day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)),
    );
  }

  function toggleDay(dayOfWeek: number) {
    const day = schedule.find(entry => entry.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDay(dayOfWeek, { enabled: !day.enabled });
  }

  return (
    <div className="space-y-6 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-base font-medium">General</h3>
        <p className="text-xs text-muted-foreground">
          Set send limits and when messages may go out.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dailyLimit">Daily message limit (per account)</Label>
        <Select
          value={String(dailyLimitPerAccount)}
          onValueChange={value => onDailyLimitChange(Number.parseInt(value, 10))}
        >
          <SelectTrigger id="dailyLimit" className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[50, 100, 200, 500, 1000, 1500, 2000].map(option => (
              <SelectItem key={option} value={String(option)}>
                {option} DMs
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="dmsPerHourSlider">
            Send {dmsPerHour} DMs per account per hour
          </Label>
          <span className="text-xs text-muted-foreground">{formatSendInterval(dmsPerHour)}</span>
        </div>
        <input
          id="dmsPerHourSlider"
          type="range"
          min={1}
          max={60}
          step={1}
          value={dmsPerHour}
          onChange={e => onDmsPerHourChange(Number.parseInt(e.target.value, 10))}
          className="w-full accent-primary"
        />
        {dmsPerHour > 20 && (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            We strongly advise against going over 20 DMs per hour to avoid spam and protect
            your account from getting suspended.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Label>Schedule</Label>
          <div className="flex gap-1">
            {CAMPAIGN_DAY_SHORT_LABELS.map((label, index) => {
              const day = schedule.find(entry => entry.dayOfWeek === index);
              const active = day?.enabled ?? false;
              return (
                <button
                  key={`${label}-${index}`}
                  type="button"
                  aria-label={CAMPAIGN_DAY_LABELS[index]}
                  onClick={() => toggleDay(index)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          {schedule.map(day => (
            <div
              key={day.dayOfWeek}
              className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-sm ${
                day.enabled ? "" : "opacity-50"
              }`}
            >
              <span>{CAMPAIGN_DAY_LABELS[day.dayOfWeek]}</span>
              <Select
                value={minuteToTimeOption(day.startMinute)}
                disabled={!day.enabled}
                onValueChange={value =>
                  updateDay(day.dayOfWeek, { startMinute: parseTimeOption(value) })
                }
              >
                <SelectTrigger className="w-[5.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.slice(0, -1).map(option => (
                    <SelectItem key={`start-${day.dayOfWeek}-${option}`} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={minuteToTimeOption(day.endMinute)}
                disabled={!day.enabled}
                onValueChange={value =>
                  updateDay(day.dayOfWeek, { endMinute: parseTimeOption(value) })
                }
              >
                <SelectTrigger className="w-[5.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.slice(1).map(option => (
                    <SelectItem key={`end-${day.dayOfWeek}-${option}`} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                aria-label={`Disable ${CAMPAIGN_DAY_LABELS[day.dayOfWeek]}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => updateDay(day.dayOfWeek, { enabled: false })}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {timezones.map(tz => (
                <SelectItem key={tz} value={tz}>
                  {formatTimezoneLabel(tz)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
