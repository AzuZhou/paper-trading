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

const message = { type: "prices", ts: 0, prices: { AAPL: 18940 } };

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

  it("stays live past two minutes while messages keep arriving", () => {
    const setConnectionStatus = vi.fn();
    const setLatest = vi.fn();
    const connection = createPriceConnection({
      setConnectionStatus,
      setLatest,
    });

    const socket = FakeSocket.instances[0];
    socket.open();
    socket.receive(message);

    for (let second = 0; second < 130; second++) {
      vi.advanceTimersByTime(1000);
      socket.receive(message);
    }

    expect(setConnectionStatus).not.toHaveBeenCalledWith("reconnecting");
    expect(setConnectionStatus).not.toHaveBeenCalledWith("unavailable");
    expect(setConnectionStatus).toHaveBeenLastCalledWith("live");

    connection.stop();
  });

  it("goes reconnecting after 5 seconds of silence", () => {
    const setConnectionStatus = vi.fn();
    const setLatest = vi.fn();
    const connection = createPriceConnection({
      setConnectionStatus,
      setLatest,
    });

    const socket = FakeSocket.instances[0];
    socket.open();
    socket.receive(message);

    vi.advanceTimersByTime(4900);
    expect(setConnectionStatus).not.toHaveBeenCalledWith("reconnecting");

    vi.advanceTimersByTime(100);
    expect(socket.closed).toBe(true);
    expect(setConnectionStatus).toHaveBeenLastCalledWith("reconnecting");
    expect(setLatest).toHaveBeenLastCalledWith(null);

    connection.stop();
  });
});
