import { WebSocket, WebSocketServer } from "ws";
import { nextPrices, type Prices } from "./prices.ts";

const PORT = Number(process.env.PORT ?? 8080);
const TICK_MS = 1000;

// Temporary: symbols live in code until storage is decided. Prices in cents.
let prices: Prices = {
  AAPL: 18940,
  MSFT: 42010,
  GOOG: 16555,
  AMZN: 18120,
  TSLA: 24980,
  NVDA: 13075,
};

// TODO: seq restarts at 0 when this service restarts. When the browser gets
// auto-reconnect, reset its saved seq on each new connection. Otherwise it
// ignores messages until seq catches up.
let seq = 0; // goes up by 1 with every message
let latest = ""; // the last message we sent, as text

const wss = new WebSocketServer({ port: PORT });

function tick() {
  prices = nextPrices(prices);
  seq += 1;
  latest = JSON.stringify({ type: "prices", seq, ts: Date.now(), prices });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(latest);
  }
}

tick(); // fills `latest` before anyone can connect
setInterval(tick, TICK_MS);

wss.on("connection", (socket) => {
  socket.on("error", console.error);
  socket.send(latest); // new clients get the current prices immediately
});

console.log(`realtime service listening on ws://localhost:${PORT}`);
