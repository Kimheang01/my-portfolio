import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  className = "mb-10 sm:mb-12",
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
      <h2 className="mt-3 text-h2 font-semibold tracking-tight">
        {title}
      </h2>
    </Reveal>
  );
}
