import { appSettings } from "../../config/settings";
import type { ContactEntry, ContactPersistenceResult } from "../types/contact";
import {
	persistContactSubmission,
	type ContactEnv,
} from "../repositories/contactSubmissionRepository.server";

async function sendNotificationEmail(entry: ContactEntry): Promise<void> {
	if (!appSettings.contact.enableEmailNotifications) {
		return;
	}

	if (!appSettings.contact.notificationWebhookUrl) {
		return;
	}

	await fetch(appSettings.contact.notificationWebhookUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			type: "contact-submission",
			entry,
		}),
	});
}

export async function submitContactEntry(
	entry: ContactEntry,
	env?: ContactEnv,
	ctx?: ExecutionContext,
): Promise<ContactPersistenceResult> {
	const persisted = await persistContactSubmission(entry, env);

	const notificationWork = sendNotificationEmail(entry).catch((error) => {
		console.error("Notification dispatch failed", error);
	});

	if (ctx) {
		ctx.waitUntil(notificationWork);
	} else {
		await notificationWork;
	}

	return persisted;
}
