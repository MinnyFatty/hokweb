export function jsonResponse(data: unknown, init?: ResponseInit) {
	const headers = {
		"Content-Type": "application/json",
		...(init?.headers as Record<string, string> | undefined),
	};

	return new Response(JSON.stringify(data), {
		status: init?.status ?? 200,
		headers,
	});
}
