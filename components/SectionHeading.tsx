import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  className = "mb-12",
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <p className="font-mono text-sm tracking-widest text-accent uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
