import type { ContactStorageBackend } from "../../config/settings";

export type ContactSubmissionInput = {
	name: string;
	surname: string;
	email: string;
	contactNumber: string;
};

export type ContactEntry = ContactSubmissionInput & {
	createdAt: string;
	poi: boolean;
};

export type ContactPersistenceResult = {
	backend: ContactStorageBackend;
	id?: string;
};
