import { expect, test } from "vitest";
import { formatGain, formatUsd } from "./format";

test("formatUsd turns cents into dollars", () => {
  expect(formatUsd(18940)).toBe("$189.40");
  expect(formatUsd(10_000_000)).toBe("$100,000.00");
});

test("formatGain always shows a sign for gains and losses", () => {
  expect(formatGain(1800)).toBe("+$18.00");
  expect(formatGain(-675)).toBe("−$6.75"); // a real minus sign, not a hyphen
});

test("formatGain shows no sign at zero", () => {
  expect(formatGain(0)).toBe("$0.00");
});
