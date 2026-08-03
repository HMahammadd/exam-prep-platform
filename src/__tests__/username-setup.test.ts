import { describe, expect, it } from "vitest";
import { needsUsernameSetup } from "../lib/username-setup";

describe("needsUsernameSetup", () => {
  it("requires setup when username is missing", () => {
    expect(needsUsernameSetup(null)).toBe(true);
    expect(needsUsernameSetup(undefined)).toBe(true);
    expect(needsUsernameSetup("")).toBe(true);
    expect(needsUsernameSetup("   ")).toBe(true);
  });

  it("requires setup for auto-generated user_<id> usernames", () => {
    expect(needsUsernameSetup("user_a1b2c3d4")).toBe(true);
    expect(needsUsernameSetup("user_ABCDEF12")).toBe(true);
  });

  it("does not require setup for chosen usernames", () => {
    expect(needsUsernameSetup("kepleracademy")).toBe(false);
    expect(needsUsernameSetup("alice")).toBe(false);
    expect(needsUsernameSetup("user_name")).toBe(false); // underscore name, not auto id
    expect(needsUsernameSetup("user_abcd")).toBe(false); // too short to be auto id
  });
});
