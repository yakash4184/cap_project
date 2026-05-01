import test from "node:test";
import assert from "node:assert/strict";

import {
  assertAdminRegistrationAuthorized,
  assertPublicRegistrationAllowed,
} from "../src/utils/adminRegistration.js";
import { isAuthorizedCronRequest } from "../src/utils/cronAuth.js";
import { parseIssueCoordinates } from "../src/utils/issueValidation.js";

test("public registration rejects admin role", () => {
  assert.throws(
    () => assertPublicRegistrationAllowed("admin"),
    /Public registration cannot create admin accounts/
  );
});

test("public registration allows citizen role", () => {
  assert.doesNotThrow(() => assertPublicRegistrationAllowed("user"));
});

test("admin registration requires matching secret", () => {
  assert.throws(
    () =>
      assertAdminRegistrationAuthorized({
        configuredSecret: "top-secret",
        providedSecret: "wrong-secret",
      }),
    /Invalid admin registration secret/
  );
});

test("cron authorization matches bearer token", () => {
  process.env.CRON_SECRET = "cron-secret";
  assert.equal(isAuthorizedCronRequest("Bearer cron-secret"), true);
  assert.equal(isAuthorizedCronRequest("Bearer wrong"), false);
});

test("issue coordinates must be numeric", () => {
  assert.deepEqual(parseIssueCoordinates("28.61", "77.20"), {
    lat: 28.61,
    lng: 77.2,
  });

  assert.throws(() => parseIssueCoordinates("north", "east"), /valid numbers/);
});
