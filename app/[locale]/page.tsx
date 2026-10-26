import Navbar from "@/components/Navbar";
import ScrollHero from "@/components/ScrollHero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getLocale } from "@/i18n/locale";
import { getPortfolio } from "@/modules/portfolio/public";

export default async function Home() {
  const { profile, socials, skillGroups, experience, projects } = await getPortfolio(
    await getLocale(),
  );

  return (
    <>
      <Navbar name={profile.name} />
      <main>
        {/* A Client Component: only the hero's own text is passed to the browser. */}
        <ScrollHero
          name={profile.name}
          roles={profile.heroRoles}
          introHeading={profile.heroIntroHeading}
          introText={profile.heroIntroText}
          statement={profile.heroStatement}
        />
        <About
          profile={profile}
          skillGroups={skillGroups}
          education={experience.find((job) => job.kind === "education")}
        />
        <Experience jobs={experience} />
        <Projects projects={projects} />
        <Contact email={profile.email} location={profile.location} socials={socials} />
      </main>
      <Footer name={profile.name} socials={socials} />
    </>
  );
}
