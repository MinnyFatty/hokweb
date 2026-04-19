import path from "node:path";
import fs from "node:fs";

import {
	appSettings,
	type ContactStorageBackend,
} from "../../config/settings";
import type { ContactEntry, ContactPersistenceResult } from "../types/contact";

type D1Like = {
	exec: (sql: string) => Promise<unknown>;
	prepare: (sql: string) => {
		bind: (...values: unknown[]) => { run: () => Promise<unknown> };
	};
};

type DurableObjectStubLike = {
	fetch: (input: string, init?: RequestInit) => Promise<Response>;
};

type DurableObjectNamespaceLike = {
	idFromName: (name: string) => unknown;
	get: (id: unknown) => DurableObjectStubLike;
};

type KVLike = {
	put: (key: string, value: string) => Promise<void>;
};

export type ContactEnv = {
	CONTACTS_DB?: D1Like;
	CONTACTS_DO?: DurableObjectNamespaceLike;
	CONTACTS_KV?: KVLike;
};

function buildContactId() {
	return `contact:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function escapeCsv(value: string) {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}

	return value;
}

async function persistToD1(
	env: ContactEnv,
	entry: ContactEntry,
): Promise<ContactPersistenceResult> {
	if (!env.CONTACTS_DB) {
		throw new Error("D1 binding is not available");
	}

	try {
		await env.CONTACTS_DB.exec(
			`CREATE TABLE IF NOT EXISTS ${appSettings.contact.d1TableName} (id TEXT PRIMARY KEY, name TEXT, surname TEXT, email TEXT, contactNumber TEXT, createdAt TEXT, poi INTEGER);`,
		);

		const id = buildContactId();
		await env.CONTACTS_DB
			.prepare(
				`INSERT INTO ${appSettings.contact.d1TableName} (id, name, surname, email, contactNumber, createdAt, poi) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				id,
				entry.name,
				entry.surname || null,
				entry.email,
				entry.contactNumber,
				entry.createdAt,
				entry.poi ? 1 : 0,
			)
			.run();

		return { backend: "d1", id };
	} catch (error) {
		console.error("D1 save failed", error);
		throw new Error("Failed to save to database");
	}
}

async function persistToDurableObject(
	env: ContactEnv,
	entry: ContactEntry,
): Promise<ContactPersistenceResult> {
	if (!env.CONTACTS_DO) {
		throw new Error("Durable Object binding is not available");
	}

	try {
		const id = env.CONTACTS_DO.idFromName("contacts");
		const stub = env.CONTACTS_DO.get(id);
		const response = await stub.fetch("https://contacts/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(entry),
		});

		if (!response.ok) {
			throw new Error(await response.text());
		}

		return { backend: "durable-object" };
	} catch (error) {
		console.error("DO save failed", error);
		throw new Error("Failed to save to Durable Object");
	}
}

async function persistToKv(
	env: ContactEnv,
	entry: ContactEntry,
): Promise<ContactPersistenceResult> {
	if (!env.CONTACTS_KV) {
		throw new Error("KV binding is not available");
	}

	try {
		const key = buildContactId();
		await env.CONTACTS_KV.put(key, JSON.stringify(entry));

		return { backend: "kv", id: key };
	} catch (error) {
		console.error("KV put failed", error);
		throw new Error("Failed to save to KV");
	}
}

async function persistToLocalCsv(
	entry: ContactEntry,
): Promise<ContactPersistenceResult> {
	try {
		const csvLine = `${escapeCsv(entry.name)},${escapeCsv(entry.surname)},${escapeCsv(entry.email)},${escapeCsv(entry.contactNumber)},${entry.createdAt}\n`;
		const dataDir = path.resolve(
			process.cwd(),
			appSettings.contact.localCsvDirectory,
		);
		const filePath = path.join(dataDir, appSettings.contact.localCsvFileName);

		if (!fs.existsSync(dataDir)) {
			fs.mkdirSync(dataDir);
		}

		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, "name,surname,email,contactNumber,createdAt\n");
		}

		fs.appendFileSync(filePath, csvLine);

		return { backend: "local-csv" };
	} catch (error) {
		console.error("Failed to write CSV", error);
		throw new Error("Failed to save");
	}
}

function getFirstAvailableBackend(env?: ContactEnv): ContactStorageBackend {
	for (const backend of appSettings.contact.storagePriority) {
		if (backend === "d1" && env?.CONTACTS_DB) {
			return "d1";
		}
		if (backend === "durable-object" && env?.CONTACTS_DO) {
			return "durable-object";
		}
		if (backend === "kv" && env?.CONTACTS_KV) {
			return "kv";
		}
	}

	return "local-csv";
}

export async function persistContactSubmission(
	entry: ContactEntry,
	env?: ContactEnv,
): Promise<ContactPersistenceResult> {
	const backend = getFirstAvailableBackend(env);

	if (backend === "d1") {
		return persistToD1(env ?? {}, entry);
	}

	if (backend === "durable-object") {
		return persistToDurableObject(env ?? {}, entry);
	}

	if (backend === "kv") {
		return persistToKv(env ?? {}, entry);
	}

	return persistToLocalCsv(entry);
}
