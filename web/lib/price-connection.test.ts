import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createPriceConnection } from "./price-connection";

class FakeSocket {
  static instances: FakeSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  closed = false;

  constructor(public url: string) {
    FakeSocket.instances.push(this); // so the test can find it
  }

  close() {
    this.closed = true;
  }
  open() {
    this.onopen?.();
  }
  receive(message: unknown) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

const message = { type: "prices", seq: 1, ts: 0, prices: { AAPL: 18940 } };

describe("createPriceConnection", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal("WebSocket", FakeSocket);
    FakeSocket.instances = [];
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("goes live and delivers prices on the first valid message", () => {
    const setConnectionStatus = vi.fn();
    const setLatest = vi.fn();
    const connection = createPriceConnection({
      setConnectionStatus,
      setLatest,
    });

    const socket = FakeSocket.instances[0];
    socket.open();
    socket.receive(message);

    expect(setConnectionStatus).toHaveBeenLastCalledWith("live");
    expect(setLatest).toHaveBeenLastCalledWith(message);

    connection.stop();
  });
});
