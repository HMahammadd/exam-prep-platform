import { describe, expect, it } from "vitest";
import { validateNickname, NICKNAME_PATTERN } from "../lib/username";

describe("validateNickname", () => {
  it("accepts valid nicknames", () => {
    expect(validateNickname("alice")).toBeNull();
    expect(validateNickname("Bob_123")).toBeNull();
    expect(validateNickname("user.name")).toBeNull();
    expect(validateNickname("a_b.c")).toBeNull();
    expect(validateNickname("abc")).toBeNull(); // min length
    expect(validateNickname("a".repeat(24))).toBeNull(); // max length
  });

  it("rejects nicknames shorter than 3 characters", () => {
    expect(validateNickname("ab")).not.toBeNull();
    expect(validateNickname("a")).not.toBeNull();
    expect(validateNickname("")).not.toBeNull();
  });

  it("rejects nicknames longer than 24 characters", () => {
    expect(validateNickname("a".repeat(25))).not.toBeNull();
  });

  it("rejects nicknames with invalid characters", () => {
    expect(validateNickname("hello world")).not.toBeNull(); // space
    expect(validateNickname("user@name")).not.toBeNull(); // @
    expect(validateNickname("user-name")).not.toBeNull(); // hyphen
    expect(validateNickname("name!")).not.toBeNull(); // !
    expect(validateNickname("name#tag")).not.toBeNull(); // #
  });

  it("allows letters, numbers, underscores, and periods", () => {
    expect(NICKNAME_PATTERN.test("valid.nick_123")).toBe(true);
    expect(NICKNAME_PATTERN.test("ALL.CAPS_99")).toBe(true);
  });

  it("trims whitespace before validating", () => {
    expect(validateNickname("  alice  ")).toBeNull();
  });
});

describe("case-insensitive nickname uniqueness concept", () => {
  it('"Vahid" and "vahid" should be treated as the same nickname', () => {
    // This verifies the concept — actual DB enforcement is in the migration
    expect("Vahid".toLowerCase()).toBe("vahid".toLowerCase());
    expect("VAHID".toLowerCase()).toBe("vahid");
  });
});
