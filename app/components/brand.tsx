type BrandLogoProps = {
	compact?: boolean;
	className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
	const imageSrc = compact ? "/favicon.png" : "/logo.jpeg";
	const imageAlt = compact
		? "House of Knowledge icon"
		: "House of Knowledge official logo";

	return (
		<div className={`brand-logo ${compact ? "is-compact" : ""} ${className}`.trim()}>
			<img src={imageSrc} alt={imageAlt} className="brand-logo-image" />
			{compact ? <p className="brand-title">House of Knowledge</p> : null}
		</div>
	);
}