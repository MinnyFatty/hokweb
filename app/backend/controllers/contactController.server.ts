import type { ActionArgs } from "react-router";

import { jsonResponse } from "../utils/http.server";
import { submitContactEntry } from "../services/contactSubmissionService.server";
import type { ContactEntry, ContactSubmissionInput } from "../types/contact";
import type { ContactEnv } from "../repositories/contactSubmissionRepository.server";

type CloudflareActionContext = {
	cloudflare?: {
		env?: ContactEnv;
		ctx?: ExecutionContext;
	};
};

function parseContactInput(formData: FormData): ContactSubmissionInput {
	return {
		name: (formData.get("name") || "").toString().trim(),
		surname: (formData.get("surname") || "").toString().trim(),
		email: (formData.get("email") || "").toString().trim(),
		contactNumber: (formData.get("contactNumber") || "").toString().trim(),
	};
}

function validateContactInput(input: ContactSubmissionInput): string | undefined {
	if (!input.name || !input.email || !input.contactNumber) {
		return "Missing required fields";
	}

	return undefined;
}

function toContactEntry(input: ContactSubmissionInput): ContactEntry {
	return {
		...input,
		createdAt: new Date().toISOString(),
		poi: true,
	};
}

export async function handleCreateContactAction({
	request,
	context,
}: ActionArgs): Promise<Response> {
	const formData = await request.formData();
	const input = parseContactInput(formData);
	const validationError = validateContactInput(input);

	if (validationError) {
		return jsonResponse({ ok: false, error: validationError }, { status: 400 });
	}

	const entry = toContactEntry(input);
	const cloudflareContext = context as CloudflareActionContext;

	try {
		await submitContactEntry(
			entry,
			cloudflareContext.cloudflare?.env,
			cloudflareContext.cloudflare?.ctx,
		);
		return jsonResponse({ ok: true });
	} catch (error) {
		console.error("Failed to submit contact entry", error);
		const errorMessage =
			error instanceof Error ? error.message : "Failed to save";
		return jsonResponse({ ok: false, error: errorMessage }, { status: 500 });
	}
}
