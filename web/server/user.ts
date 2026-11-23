import "server-only";
import { cookies } from "next/headers";
import { sql } from "./db";

const COOKIE = "user_id";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getUserId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;

  if (existing && UUID.test(existing)) {
    const found = await sql`select id from users where id = ${existing}`;
    if (found.length > 0) return existing;
  }

  const created = await sql`insert into users default values returning id`;
  const id = created[0].id;

  store.set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return id;
}
