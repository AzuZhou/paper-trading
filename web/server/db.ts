import "server-only";
import { neon, Pool } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

export const sql = neon(url);
export const pool = new Pool({ connectionString: url });
