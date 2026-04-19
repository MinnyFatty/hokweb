// @ts-nocheck
import { Link, Form, useActionData, useNavigation } from "react-router";
import type { ActionArgs } from "react-router";

export function meta() {
  return [
    { title: "Contact Us | House of Knowledge" },
    {
      name: "description",
      content: "Contact House of Knowledge and submit your details through our contact form.",
    },
  ];
}

const json = (data: any, init?: ResponseInit) => {
  const headers = { "Content-Type": "application/json", ...(init?.headers as Record<string, string> | undefined) };
  return new Response(JSON.stringify(data), { status: init?.status ?? 200, headers });
};

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
  // Prefer writing to D1 if available
  if (env && env.CONTACTS_DB) {
    try {
      // Ensure the table exists (safe to run on every submit)
      await env.CONTACTS_DB.exec(
        "CREATE TABLE IF NOT EXISTS contacts (id TEXT PRIMARY KEY, name TEXT, surname TEXT, email TEXT, contactNumber TEXT, createdAt TEXT, poi INTEGER);",
      );

      const id = `contact:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
      await env.CONTACTS_DB
        .prepare(
          `INSERT INTO contacts (id, name, surname, email, contactNumber, createdAt, poi) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, entry.name, entry.surname || null, entry.email, entry.contactNumber, entry.createdAt, entry.poi ? 1 : 0)
        .run();

      return json({ ok: true });
    } catch (err) {
      console.error("D1 save failed", err);
      return json({ ok: false, error: "Failed to save to database" }, { status: 500 });
    }
  }

  // Prefer storing in the Durable Object if available
  if (env && env.CONTACTS_DO) {
    try {
      const id = env.CONTACTS_DO.idFromName("contacts");
      const stub = env.CONTACTS_DO.get(id);
      const res = await stub.fetch("https://contacts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) {
        console.error("DO save failed", await res.text());
        return json({ ok: false, error: "Failed to save to Durable Object" }, { status: 500 });
      }
      return json({ ok: true });
    } catch (err) {
      console.error("DO save failed", err);
      return json({ ok: false, error: "Failed to save to Durable Object" }, { status: 500 });
    }
  }

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

export default function ContactPage() {
  return (
    <section className="contact-page">
      <header className="contact-page-header">
        <h1>House Of Knowledge</h1>
        <p>Contact: admin@houseofknowledge.net</p>
      </header>

      <div className="contact-layout">
        <article className="contact-intro">
          <h2>Contact Us</h2>
          <p>
            Share your details and we will reach out with the right information,
            learning options, and next steps.
          </p>
          <ul>
            <li>Personal response from our team</li>
            <li>Guidance based on your interests</li>
            <li>Clear next actions after submission</li>
          </ul>

          <div className="contact-details" aria-label="Direct contact details">
            <h3>Direct Contact Details</h3>

            <a className="contact-detail-item" href="tel:+27659272238" aria-label="Call House of Knowledge">
              <span className="contact-icon" aria-hidden="true">📞</span>
              <span>0659272238</span>
            </a>

            <a className="contact-detail-item" href="mailto:admin@houseofknowledge.net" aria-label="Email House of Knowledge">
              <span className="contact-icon" aria-hidden="true">
                <svg className="social-logo" viewBox="0 0 24 24" role="img" aria-label="Envelope">
                  <rect x="2.5" y="5" width="19" height="14" rx="2" fill="#f3f7fb" stroke="#113d74" strokeWidth="1.8" />
                  <path d="M3.8 6.6 12 13.1l8.2-6.5" fill="none" stroke="#113d74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>admin@houseofknowledge.net</span>
            </a>

            <a
              className="contact-detail-item"
              href="https://www.facebook.com/search/top?q=House%20of%20Knowledge%20-%20Light%20of%20Youth"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Facebook page"
            >
              <span className="contact-icon" aria-hidden="true">
                <img className="social-logo" src="/fb_logo.png" alt="Facebook" />
              </span>
              <span>House of Knowledge - Light of Youth</span>
            </a>

            <a
              className="contact-detail-item"
              href="https://www.instagram.com/houseofknowledge_lightofyouth/"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Instagram page"
            >
              <span className="contact-icon" aria-hidden="true">
                <img
                  className="social-logo"
                  src="/instagram-logo-png-transparent-background-300x300.png"
                  alt="Instagram"
                />
              </span>
              <span>@houseofknowledge_lightofyouth</span>
            </a>
          </div>
        </article>

        <form method="post" className="contact-form">
          <h2>Contact Form</h2>

          <label>
            <span>Name *</span>
            <input name="name" required />
          </label>

          <label>
            <span>Surname</span>
            <input name="surname" />
          </label>

          <label>
            <span>Email *</span>
            <input name="email" type="email" required />
          </label>

          <label>
            <span>Contact Number *</span>
            <input name="contactNumber" required />
          </label>

          <button type="submit" className="button-primary">Submit</button>
        </form>
      </div>
    </section>
  );
}
