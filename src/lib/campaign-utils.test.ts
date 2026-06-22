import { expect, test } from "bun:test";
import {
  canStopCampaign,
  formatCampaignAudienceLabel,
  formatCampaignProgressLabel,
  formatRelativeEta,
  isCampaignActive,
  isCampaignPolling,
  parseTargetUsernames,
} from "./campaign-utils";

test("parseTargetUsernames deduplicates and normalizes", () => {
  expect(parseTargetUsernames("@Alice\nbob, Alice\n  ")).toEqual(["alice", "bob"]);
});

test("isCampaignActive for pending, running, and paused", () => {
  expect(isCampaignActive("pending")).toBe(true);
  expect(isCampaignActive("running")).toBe(true);
  expect(isCampaignActive("paused")).toBe(true);
  expect(isCampaignActive("stopped")).toBe(false);
  expect(isCampaignActive("completed")).toBe(false);
});

test("isCampaignPolling includes syncing states", () => {
  expect(isCampaignPolling("syncing", "syncing")).toBe(true);
  expect(isCampaignPolling("draft", "completed")).toBe(false);
});

test("canStopCampaign includes draft and syncing", () => {
  expect(canStopCampaign("draft")).toBe(true);
  expect(canStopCampaign("syncing")).toBe(true);
  expect(canStopCampaign("completed")).toBe(false);
});

test("formatCampaignAudienceLabel for follower campaigns", () => {
  expect(
    formatCampaignAudienceLabel({
      audienceType: "followers",
      targetUsername: "alice",
      totalTargets: 0,
      syncedFollowerCount: 42,
      status: "syncing",
    }),
  ).toContain("@alice");
});

test("formatCampaignProgressLabel for draft and syncing", () => {
  expect(
    formatCampaignProgressLabel({
      status: "draft",
      totalTargets: 0,
      messagesSent: 0,
      failedCount: 0,
      progressPercent: 0,
    }),
  ).toBe("Awaiting start");
});

test("formatRelativeEta returns null when missing", () => {
  expect(formatRelativeEta(undefined)).toBeNull();
});
