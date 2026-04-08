// @ts-nocheck
import { json, type ActionArgs } from "react-router";

// Server-side action to handle contact form submissions.
// When running on Cloudflare Workers this will store submissions in a KV namespace
// bound as `CONTACTS_KV`. When KV is not available (local Node dev) it falls
// back to writing a CSV file to `data/contacts.csv`.
export async function action({ request, context }: ActionArgs) {
  const formData = await request.formData();
  const name = (formData.get("name") || "").toString().trim();
  const surname = (formData.get("surname") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const contactNumber = (formData.get("contactNumber") || "").toString().trim();

  if (!name || !email || !contactNumber) {
    return json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const entry = {
    name,
    surname,
    email,
    contactNumber,
    createdAt: new Date().toISOString(),
    poi: true,
  };

  // Try to get Cloudflare env from route context (workers/app.ts passes this in)
  const env = (context as any)?.cloudflare?.env as Record<string, any> | undefined;

  if (env && env.CONTACTS_KV) {
    try {
      // Use a unique key per submission
      const key = `contact:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      await env.CONTACTS_KV.put(key, JSON.stringify(entry));
      return json({ ok: true });
    } catch (err) {
      console.error("KV put failed", err);
      return json({ ok: false, error: "Failed to save to KV" }, { status: 500 });
    }
  }

  // Fallback for local Node development: write to CSV on disk.
  try {
    const { default: fs } = await import("fs");
    const { default: path } = await import("path");

    const escapeCsv = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvLine = `${escapeCsv(name)},${escapeCsv(surname)},${escapeCsv(email)},${escapeCsv(contactNumber)},${entry.createdAt}\n`;
    const dataDir = path.resolve(process.cwd(), "data");
    const filePath = path.join(dataDir, "contacts.csv");

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "name,surname,email,contactNumber,createdAt\n");
    }
    fs.appendFileSync(filePath, csvLine);
    return json({ ok: true });
  } catch (err) {
    console.error("Failed to write CSV", err);
    return json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
