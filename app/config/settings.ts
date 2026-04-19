export const appSettings = {
	contact: {
		storagePriority: ["d1", "durable-object", "kv", "local-csv"] as const,
		d1TableName: "contacts",
		localCsvDirectory: "data",
		localCsvFileName: "contacts.csv",
		enableEmailNotifications: false,
		notificationWebhookUrl: "",
	},
	publicContact: {
		supportPhone: "0659272238",
		supportEmail: "admin@houseofknowledge.net",
		facebookLabel: "House of Knowledge - Light of Youth",
		instagramHandle: "@houseofknowledge_lightofyouth",
	},
} as const;

export type ContactStorageBackend =
	(typeof appSettings.contact.storagePriority)[number];

export const publicSettings = {
	contact: appSettings.publicContact,
} as const;
