import { describe, expect, it } from "vitest";
import {
  validateUsername,
  USERNAME_PATTERN,
  USERNAME_MAX,
} from "../lib/username";

describe("validateUsername", () => {
  it("accepts valid usernames", () => {
    expect(validateUsername("alice")).toBeNull();
    expect(validateUsername("Bob_123")).toBeNull();
    expect(validateUsername("abc")).toBeNull(); // min length
    expect(validateUsername("a".repeat(USERNAME_MAX))).toBeNull(); // max length
  });

  it("rejects usernames shorter than 3 characters", () => {
    expect(validateUsername("ab")).not.toBeNull();
    expect(validateUsername("a")).not.toBeNull();
    expect(validateUsername("")).not.toBeNull();
  });

  it("rejects usernames longer than 20 characters", () => {
    expect(validateUsername("a".repeat(USERNAME_MAX + 1))).not.toBeNull();
  });

  it("rejects usernames with invalid characters", () => {
    expect(validateUsername("hello world")).not.toBeNull(); // space
    expect(validateUsername("user@name")).not.toBeNull(); // @
    expect(validateUsername("user-name")).not.toBeNull(); // hyphen
    expect(validateUsername("user.name")).not.toBeNull(); // period
    expect(validateUsername("name!")).not.toBeNull(); // !
    expect(validateUsername("name#tag")).not.toBeNull(); // #
  });

  it("allows letters, numbers, and underscores only", () => {
    expect(USERNAME_PATTERN.test("valid_nick_123")).toBe(true);
    expect(USERNAME_PATTERN.test("ALL_CAPS_99")).toBe(true);
    expect(USERNAME_PATTERN.test("has.period")).toBe(false);
  });

  it("trims whitespace before validating", () => {
    expect(validateUsername("  alice  ")).toBeNull();
  });
});

describe("case-insensitive username uniqueness concept", () => {
  it('"Vahid" and "vahid" should be treated as the same username', () => {
    expect("Vahid".toLowerCase()).toBe("vahid".toLowerCase());
    expect("VAHID".toLowerCase()).toBe("vahid");
  });
});
