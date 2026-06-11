import { expect, test } from "bun:test";
import { HUB_BACKEND_API_PREFIX, HubApiError, oauthStartUrl } from "./client";

test("HubApiError carries status", () => {
  const err = new HubApiError("Unauthorized", 401);
  expect(err.message).toBe("Unauthorized");
  expect(err.status).toBe(401);
  expect(err.name).toBe("HubApiError");
});

test("oauthStartUrl uses xbot API prefix", () => {
  expect(oauthStartUrl("invite-token")).toContain(
    `/${HUB_BACKEND_API_PREFIX}/oauth/x/start?invite=invite-token`,
  );
});
