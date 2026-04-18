import {
	isRouteErrorResponse,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { BrandLogo } from "./components/brand";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{ rel: "icon", href: "/house_of_knowledge_transparent.ico", type: "image/x-icon" },
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;700&family=Manrope:wght@400;500;700;800&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body className="brand-body">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<div className="site-shell">
			<header className="site-header">
				<Link to="/" className="brand-link" aria-label="Go to House of Knowledge home page">
					<BrandLogo compact />
				</Link>
				<nav className="site-nav" aria-label="Primary">
					<Link to="/">Home</Link>
					<Link to="/contactus">Contact Us</Link>
				</nav>
			</header>
			<main className="site-main">
				<Outlet />
			</main>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="error-view">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="error-stack">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
