// @ts-nocheck
import type { ActionArgs } from "react-router";

// Admin action to migrate all keys from CONTACTS_KV into the Contacts Durable Object.
// Protect with `MIGRATE_TOKEN` env var: include header `x-migrate-token: <token>` when calling.
export async function action({ request, context }: ActionArgs) {
  const env = (context as any)?.cloudflare?.env as Record<string, any> | undefined;
  if (!env) return new Response("No env", { status: 500 });

  const token = request.headers.get("x-migrate-token");
  if (!env.MIGRATE_TOKEN || token !== env.MIGRATE_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  if (!env.CONTACTS_KV) return new Response(JSON.stringify({ ok: false, error: "No CONTACTS_KV binding" }), { status: 500, headers: { "Content-Type": "application/json" } });
  if (!env.CONTACTS_DO) return new Response(JSON.stringify({ ok: false, error: "No CONTACTS_DO binding" }), { status: 500, headers: { "Content-Type": "application/json" } });

  const list = await env.CONTACTS_KV.list();
  let migrated = 0;
  for (const k of list.keys) {
    try {
      const value = await env.CONTACTS_KV.get(k.name, { type: "json" });
      if (!value) continue;
      const id = env.CONTACTS_DO.idFromName("contacts");
      const stub = env.CONTACTS_DO.get(id);
      const res = await stub.fetch("https://contacts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (res.ok) {
        migrated++;
        // Optionally delete from KV after successful migration:
        // await env.CONTACTS_KV.delete(k.name);
      } else {
        console.error("Failed to migrate key", k.name, await res.text());
      }
    } catch (err) {
      console.error("Error migrating key", k.name, err);
    }
  }

  return new Response(JSON.stringify({ ok: true, migrated }), { headers: { "Content-Type": "application/json" } });
}
