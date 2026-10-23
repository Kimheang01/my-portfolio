import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <Reveal className="mb-12">
      <p className="font-mono text-sm tracking-widest text-accent uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
