import { describe, expect, it } from "vitest";
import { parseStringList } from "./recipes";

describe("parseStringList", () => {
  it("converts array values to strings", () => {
    const result = parseStringList(["apple", 1, true]);
    expect(result).toEqual(["apple", "1", "true"]);
  });

  it("splits newline or comma separated strings", () => {
    const value = "apple, banana\npear";
    expect(parseStringList(value)).toEqual(["apple", "banana", "pear"]);
  });

  it("parses JSON arrays embedded in strings", () => {
    const value = '["apple","banana","pear"]';
    expect(parseStringList(value)).toEqual(["apple", "banana", "pear"]);
  });

  it("falls back to splitting invalid JSON strings", () => {
    const value = '["apple", banana, pear]';
    expect(parseStringList(value)).toEqual(["[\"apple\"", "banana", "pear]"]);
  });

  it("returns an empty array for blank or unsupported values", () => {
    expect(parseStringList("   ")).toEqual([]);
    expect(parseStringList(42)).toEqual([]);
    expect(parseStringList(null)).toEqual([]);
  });
});
