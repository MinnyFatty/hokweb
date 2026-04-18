// @ts-nocheck
import type { LoaderArgs } from "react-router";

// Admin loader to list recent contacts from the D1 database.
// Protected by `MIGRATE_TOKEN` header: include `x-migrate-token: <token>`.
export async function loader({ request, context }: LoaderArgs) {
  const env = (context as any)?.cloudflare?.env as Record<string, any> | undefined;
  if (!env) return new Response(JSON.stringify({ ok: false, error: "No env" }), { status: 500, headers: { "Content-Type": "application/json" } });

  const token = request.headers.get("x-migrate-token");
  if (!env.MIGRATE_TOKEN || token !== env.MIGRATE_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  if (!env.CONTACTS_DB) return new Response(JSON.stringify({ ok: false, error: "No CONTACTS_DB binding" }), { status: 500, headers: { "Content-Type": "application/json" } });

  try {
    // Ensure table exists first (allow on-demand creation)
    await env.CONTACTS_DB.exec(
      "CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT, surname TEXT, email TEXT, contactNumber TEXT, createdAt TEXT, poi INTEGER);",
    );

    // Return the most recent 100 contacts
    const res = await env.CONTACTS_DB.prepare(
      `SELECT id, name, surname, email, contactNumber, createdAt, poi FROM contacts ORDER BY createdAt DESC LIMIT 100`,
    ).all();
    return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
