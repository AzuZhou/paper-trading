import "server-only";
import {
  type Account,
  buy,
  holdingsFromTrades,
  sell,
  type Trade,
  type TradeResult,
} from "@/lib/account";
import { pool, sql } from "./db";

type TradeRow = {
  side: "buy" | "sell";
  symbol: string;
  quantity: number;
  price_cents: number;
};

function normalizeAccount(cashCents: number, rows: TradeRow[]): Account {
  const trades: Trade[] = rows.map((row) => ({
    side: row.side,
    symbol: row.symbol,
    quantity: row.quantity,
    priceCents: row.price_cents,
  }));

  return { cashCents, holdings: holdingsFromTrades(trades), trades };
}

export async function getAccount(userId: string): Promise<Account> {
  const [user] = await sql`select cash_cents from users where id = ${userId}`;
  const rows = (await sql`
    select side, symbol, quantity, price_cents
    from trades where user_id = ${userId} order by id
  `) as TradeRow[];

  return normalizeAccount(user.cash_cents, rows);
}

// The price is passed in: the caller fetches it first, so we never hold
// the lock while waiting on another server.
export async function placeTrade(
  userId: string,
  side: "buy" | "sell",
  symbol: string,
  quantity: number,
  priceCents: number,
): Promise<TradeResult> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    // Locks this user's row until commit, so a second trade waits its turn.
    const user = await client.query(
      "select cash_cents from users where id = $1 for update",
      [userId],
    );
    const history = await client.query(
      `select side, symbol, quantity, price_cents
       from trades where user_id = $1 order by id`,
      [userId],
    );
    const account = normalizeAccount(user.rows[0].cash_cents, history.rows);
    const result =
      side === "buy"
        ? buy(account, symbol, quantity, priceCents)
        : sell(account, symbol, quantity, priceCents);

    if (!result.ok) {
      await client.query("rollback");
      return result;
    }

    await client.query(
      `insert into trades (user_id, symbol, side, quantity, price_cents)
       values ($1, $2, $3, $4, $5)`,
      [userId, symbol, side, quantity, priceCents],
    );
    await client.query("update users set cash_cents = $1 where id = $2", [
      result.account.cashCents,
      userId,
    ]);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
