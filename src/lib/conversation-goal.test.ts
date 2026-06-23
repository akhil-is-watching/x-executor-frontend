import { describe, expect, it } from "vitest";
import {
  GOAL_OPTIONS,
  buildGoalText,
  buildGoalsConfigFromSelectedGoal,
  isReplyConfigDraftValid,
  migrateDirectnessToOutreachStyle,
  normalizeGoalsConfig,
  resolveDraftOutreachStyle,
  resolveGoalOptionIdFromDetails,
} from "@/lib/conversation-goal";

describe("conversation-goal helpers", () => {
  it("normalizes goals without directness", () => {
    expect(
      normalizeGoalsConfig({
        types: ["custom"],
        details: "Invite users naturally.",
      }),
    ).toEqual({
      types: ["custom"],
      details: "Invite users naturally.",
    });
  });

  it("migrates legacy directness to outreach style", () => {
    expect(migrateDirectnessToOutreachStyle(20)).toBe("subtle");
    expect(migrateDirectnessToOutreachStyle(80)).toBe("assertive");
  });

  it("reads outreach style from legacy goal directness", () => {
    expect(
      resolveDraftOutreachStyle({
        id: "org-1",
        name: "Test",
        createdBy: "user-1",
        draftConversationGoals: {
          types: ["custom"],
          details: "Goal",
          directness: 90,
        },
      }),
    ).toBe("assertive");
  });

  it("buildGoalText returns the preset template", () => {
    const demo = GOAL_OPTIONS[0];
    expect(buildGoalText(demo)).toBe(demo.template);
  });

  it("resolveGoalOptionIdFromDetails matches known templates", () => {
    const demo = GOAL_OPTIONS[0];
    expect(resolveGoalOptionIdFromDetails(demo.template)).toBe("demo");
    expect(resolveGoalOptionIdFromDetails("unknown goal text")).toBeNull();
  });

  it("buildGoalsConfigFromSelectedGoal saves as custom with template", () => {
    expect(buildGoalsConfigFromSelectedGoal("intro")).toEqual({
      types: ["custom"],
      details: GOAL_OPTIONS.find(option => option.id === "intro")!.template,
    });
    expect(buildGoalsConfigFromSelectedGoal(null)).toEqual({
      types: [],
      details: "",
    });
  });

  it("isReplyConfigDraftValid accepts reference doc or goal preset", () => {
    expect(isReplyConfigDraftValid("Reference doc", null)).toBe(true);
    expect(isReplyConfigDraftValid("", "demo")).toBe(true);
    expect(isReplyConfigDraftValid("", null)).toBe(false);
  });
});
