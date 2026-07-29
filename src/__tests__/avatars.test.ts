import { describe, expect, it } from "vitest";
import {
  AVATARS,
  DEFAULT_AVATAR_ID,
  getAvatarById,
  isValidAvatarId,
} from "../lib/avatars";

describe("avatar configuration", () => {
  it("has a default avatar", () => {
    expect(AVATARS.find((a) => a.id === DEFAULT_AVATAR_ID)).toBeDefined();
  });

  it("all avatars have required fields", () => {
    for (const avatar of AVATARS) {
      expect(avatar.id).toBeTruthy();
      expect(avatar.label).toBeTruthy();
      expect(avatar.src).toBeTruthy();
      expect(avatar.src).toMatch(/^\/avatars\/.+\.svg$/);
    }
  });

  it("avatar IDs are unique", () => {
    const ids = AVATARS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getAvatarById returns matching avatar", () => {
    const result = getAvatarById("robot");
    expect(result.id).toBe("robot");
  });

  it("getAvatarById returns default for unknown ID", () => {
    const result = getAvatarById("nonexistent");
    expect(result.id).toBe(DEFAULT_AVATAR_ID);
  });

  it("getAvatarById handles null/undefined", () => {
    expect(getAvatarById(null).id).toBe(DEFAULT_AVATAR_ID);
    expect(getAvatarById(undefined).id).toBe(DEFAULT_AVATAR_ID);
  });

  it("isValidAvatarId validates correctly", () => {
    expect(isValidAvatarId("default")).toBe(true);
    expect(isValidAvatarId("cat")).toBe(true);
    expect(isValidAvatarId("nonexistent")).toBe(false);
    expect(isValidAvatarId("")).toBe(false);
  });
});
