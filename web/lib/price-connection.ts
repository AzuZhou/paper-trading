import { isValidPricesMessage, type PricesMessage } from "@/lib/prices-message";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL ?? "ws://localhost:8080";

const FIRST_RETRY_MS = 1000;
const MAX_RETRY_MS = 10_000;
const GIVE_UP_MS = 2 * 60 * 1000;
const SILENCE_MS = 5_000;

export type ConnectionStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "unavailable";

type PriceConnectionProps = {
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLatest: (latest: PricesMessage | null) => void;
};

export const createPriceConnection = ({
  setConnectionStatus,
  setLatest,
}: PriceConnectionProps) => {
  let socket: WebSocket | undefined;
  let status: ConnectionStatus = "connecting";
  let retryTimer: number | undefined;
  let giveUpTimer: number | undefined;
  let silenceTimer: number | undefined;
  let retryMs = FIRST_RETRY_MS;
  let lastSeq = -1;

  const setStatus = (nextStatus: ConnectionStatus) => {
    status = nextStatus;
    setConnectionStatus(nextStatus);
  };

  const giveUp = () => {
    window.clearTimeout(retryTimer);
    window.clearTimeout(silenceTimer);

    if (socket) {
      socket.onclose = null; // closing on purpose is not a disconnect
      socket.close();
    }

    setStatus("unavailable");
  };

  const startGiveUpTimer = () => {
    // starts the countdown and saves the id in the variable
    if (giveUpTimer) return; // already running
    giveUpTimer = window.setTimeout(giveUp, GIVE_UP_MS);
  };

  const stopGiveUpTimer = () => {
    // cancels the countdown and empties the variable
    window.clearTimeout(giveUpTimer);
    giveUpTimer = undefined;
  };

  const startSilenceTimer = () => {
    window.clearTimeout(silenceTimer);

    silenceTimer = window.setTimeout(() => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      handleDisconnect();
    }, SILENCE_MS);
  };

  const handleDisconnect = () => {
    clearTimeout(silenceTimer);
    setLatest(null);
    if (status === "live") setStatus("reconnecting");
    startGiveUpTimer();
    retryTimer = window.setTimeout(connect, retryMs);
    retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
  };

  const connect = () => {
    socket = new WebSocket(REALTIME_URL);

    socket.onopen = () => {
      lastSeq = -1; // a new connection may be a restarted server

      startSilenceTimer();
    };

    socket.onmessage = (event) => {
      let message: unknown;
      try {
        message = JSON.parse(event.data);
      } catch {
        return; // not JSON, ignore it
      }
      if (!isValidPricesMessage(message)) return;
      // Ignore anything older than what this connection already showed.
      if (message.seq <= lastSeq) return;
      lastSeq = message.seq;
      // A message proves the connection is healthy. A server that accepts
      // and then closes right away (for example when it is full) never
      // gets here, so the state stays steady and the delay keeps growing.
      startSilenceTimer();
      stopGiveUpTimer();
      retryMs = FIRST_RETRY_MS;
      setStatus("live");
      setLatest(message);
    };

    socket.onclose = () => {
      handleDisconnect();
    };
  };

  const stop = () => {
    window.clearTimeout(giveUpTimer);
    window.clearTimeout(retryTimer);
    window.clearTimeout(silenceTimer);
    if (socket) {
      socket.onclose = null; // closing on purpose is not a disconnect
      socket.close();
    }
  };

  connect();
  startGiveUpTimer();

  return { stop };
};
