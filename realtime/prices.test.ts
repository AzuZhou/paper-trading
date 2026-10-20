import assert from "node:assert/strict";
import { test } from "node:test";
import { nextPrices, type Prices } from "./prices.ts";

test("highest random number moves the price up by 0.5%", () => {
  assert.deepEqual(
    nextPrices({ AAPL: 18940 }, () => 1),
    { AAPL: 19035 },
  );
});

test("lowest random number moves the price down by 0.5%", () => {
  assert.deepEqual(
    nextPrices({ AAPL: 18940 }, () => 0),
    { AAPL: 18845 },
  );
});

test("middle random number leaves the price unchanged", () => {
  assert.deepEqual(
    nextPrices({ AAPL: 18940 }, () => 0.5),
    { AAPL: 18940 },
  );
});

test("real random keeps prices as whole, positive cents", () => {
  let prices: Prices = { AAPL: 18940, MSFT: 42010 };
  for (let i = 0; i < 1000; i++) {
    prices = nextPrices(prices);
    for (const cents of Object.values(prices)) {
      assert.ok(Number.isInteger(cents) && cents > 0);
    }
  }
});
