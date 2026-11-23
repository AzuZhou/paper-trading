import { sql } from "@/server/db";
import { getUserId } from "@/server/user";

export async function GET() {
  const userId = await getUserId();
  const [user] = await sql`select cash_cents from users where id = ${userId}`;

  return Response.json({ cashCents: user.cash_cents });
}
