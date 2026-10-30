interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** "dark" for sections on the espresso background */
  tone?: "light" | "dark";
  className?: string;
}

export function SectionHeading({ eyebrow, title, tone = "light", className = "mb-10" }: SectionHeadingProps) {
  return (
    <div className={className}>
      <p className={`text-xs tracking-[0.3em] uppercase mb-4 font-body ${tone === "dark" ? "text-brass" : "text-accent"}`}>
        {eyebrow}
      </p>
      <h2 className={`text-3xl md:text-4xl italic font-display ${tone === "dark" ? "text-cream" : "text-heading"}`}>{title}</h2>
    </div>
  );
}
