import type { Route } from "./+types/home";
import { BrandLogo } from "../components/brand";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "House of Knowledge" },
		{
			name: "description",
			content: "House of Knowledge offers practical learning paths, guidance, and support.",
		},
	];
}

export default function Home() {
	return (
		<section className="hero-panel">
			<div className="hero-grid">
				<div className="hero-copy">
					<BrandLogo className="hero-brand" />
					<h1>Build knowledge that stays with you.</h1>
					<p>
						From first principles to practical skills, House of Knowledge helps
						you turn curiosity into capability.
					</p>
					<div className="hero-actions">
						<a className="button-primary" href="/contactus">
							Go to Contact Us Page
						</a>
					</div>
				</div>
				<div className="hero-card" aria-hidden="true">
					<p className="hero-card-label">Core Focus</p>
					<ul>
						<li>Academic support and mentoring</li>
						<li>Structured learning resources</li>
						<li>Community-driven progress</li>
					</ul>
				</div>
			</div>
		</section>
	);
}
