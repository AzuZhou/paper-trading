import { expect, test } from "vitest";
import { isValidPricesMessage } from "./prices-message";

const valid = {
  type: "prices",
  seq: 1,
  ts: 1_700_000_000_000,
  prices: { AAPL: 18940, MSFT: 41250 },
};

test("accepts a well-formed prices message", () => {
  expect(isValidPricesMessage(valid)).toBe(true);
});

test("rejects values that are not objects", () => {
  expect(isValidPricesMessage(null)).toBe(false);
  expect(isValidPricesMessage("hello")).toBe(false);
  expect(isValidPricesMessage(42)).toBe(false);
});

test("rejects a wrong type or a seq that is not a number", () => {
  expect(isValidPricesMessage({ ...valid, type: "other" })).toBe(false);
  expect(isValidPricesMessage({ ...valid, seq: "1" })).toBe(false);
});

test("rejects prices that are missing, empty or an array", () => {
  expect(isValidPricesMessage({ ...valid, prices: undefined })).toBe(false);
  expect(isValidPricesMessage({ ...valid, prices: {} })).toBe(false);
  expect(isValidPricesMessage({ ...valid, prices: [1, 2] })).toBe(false);
});

test("rejects a price that is not a number", () => {
  expect(isValidPricesMessage({ ...valid, prices: { AAPL: "189.40" } })).toBe(
    false,
  );
});
