// The experience, skills, profile and Links & SEO forms.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { experienceInput } from "@/modules/experience/schema";
import { profileInput } from "@/modules/profile/schema";
import { settingsInput } from "@/modules/settings/schema";
import { skillGroupInput } from "@/modules/skills/schema";
import { rejected } from "./helpers";

describe("experience form", () => {
  const job = { title: "Dev", highlights: "Built apps\n\n  Shipped  \n", description: "" };
  const entry = {
    slug: "acme",
    kind: "work",
    organization: "Acme",
    start: "2024-06",
    end: "",
    tags: "",
    status: "draft",
    translations: { en: job, km: job },
  };
  const check = (change: object) => rejected(experienceInput, { ...entry, ...change });

  test("dates", () => {
    assert.deepEqual(check({}), []);
    assert.deepEqual(check({ end: "2024-01" }), ["end"]);
    assert.deepEqual(check({ start: "2024-13" }), ["start"]);
    assert.equal(experienceInput.parse(entry).end, null, "an empty end month is the current role");
  });

  test("publishing needs a title and some text in every language", () => {
    assert.deepEqual(check({ status: "published" }), []);
    assert.deepEqual(check({ status: "published", translations: { en: job, km: { ...job, title: "" } } }), ["translations.km.title"]);
    assert.deepEqual(
      check({ status: "published", translations: { en: job, km: { title: "T", highlights: " \n ", description: "" } } }),
      ["translations.km.highlights"],
    );
    const education = { title: "CS", highlights: "", description: "Uni" };
    assert.deepEqual(check({ status: "published", kind: "education", translations: { en: education, km: education } }), []);
  });

  test("highlights are one per line, at most 8", () => {
    assert.deepEqual(experienceInput.parse(entry).translations.en.highlights, ["Built apps", "Shipped"]);
    assert.deepEqual(check({ translations: { en: { ...job, highlights: Array(9).fill("x").join("\n") }, km: job } }), [
      "translations.en.highlights",
    ]);
  });
});

describe("skill group form", () => {
  const names = (en: string, km = "") => ({ en, km });
  const group = {
    icon: "tools",
    names: names("Tools"),
    skills: [{ names: names("Git") }, { names: names("RESTful API design", "ការរចនា RESTful API") }],
  };
  const check = (change: object) => rejected(skillGroupInput, { ...group, ...change });

  test("English names are required", () => {
    assert.deepEqual(check({}), []);
    assert.deepEqual(check({ names: names("", "ឧបករណ៍") }), ["names.en"]);
    assert.deepEqual(check({ skills: [{ names: names("") }] }), ["skills.0.names.en"]);
  });

  test("limits", () => {
    assert.deepEqual(check({ icon: "rocket" }), ["icon"]);
    assert.deepEqual(check({ skills: Array.from({ length: 31 }, (_, i) => ({ names: names(`S${i}`) })) }), ["skills"]);
  });

  test("an empty Khmer name uses the English one", () => {
    const saved = skillGroupInput.parse(group);
    assert.equal(saved.names.km, "Tools");
    assert.equal(saved.skills[0].names.km, "Git");
    assert.equal(saved.skills[1].names.km, "ការរចនា RESTful API");
  });
});

describe("profile form", () => {
  const text = {
    name: "Hen",
    role: "Dev",
    location: "PP",
    heroRoles: [{ first: "Full-Stack", second: "Developer" }],
    heroIntroHeading: "H",
    heroIntroText: "T",
    heroStatement: "S",
    aboutParagraphs: "One.\n\nTwo.\n \nThree.",
    spokenLanguages: "Khmer\nEnglish",
  };
  const profile = { email: "a@b.co", photoMediaId: null, translations: { en: text, km: text } };
  const check = (change: object) => rejected(profileInput, { ...profile, ...change });
  const inKm = (change: object) => check({ translations: { en: text, km: { ...text, ...change } } });

  test("every text is required in every language", () => {
    assert.deepEqual(check({}), []);
    assert.deepEqual(check({ email: "not-an-email" }), ["email"]);
    assert.deepEqual(inKm({ name: "" }), ["translations.km.name"]);
    assert.deepEqual(inKm({ role: "" }), ["translations.km.role"]);
    assert.deepEqual(inKm({ heroRoles: [] }), ["translations.km.heroRoles"]);
    assert.deepEqual(inKm({ heroRoles: [{ first: "A", second: " " }] }), ["translations.km.heroRoles.0.second"]);
    assert.deepEqual(inKm({ aboutParagraphs: "\n\n" }), ["translations.km.aboutParagraphs"]);
    assert.deepEqual(inKm({ spokenLanguages: "  " }), ["translations.km.spokenLanguages"]);
    assert.deepEqual(check({ photoMediaId: "abc" }), ["photoMediaId"]);
  });

  test("About splits into paragraphs at blank lines; languages are one per line", () => {
    const saved = profileInput.parse(profile);
    assert.equal(saved.translations.en.aboutParagraphs.length, 3);
    assert.deepEqual(saved.translations.en.spokenLanguages, ["Khmer", "English"]);
  });
});

describe("links & SEO form", () => {
  const socials = ["LinkedIn", "Instagram", "Telegram", "GitHub"].map((platform) => ({
    platform,
    href: `https://x.com/${platform}`,
    handle: "",
    visible: true,
  }));
  const seo = { en: { title: "T", description: "D" }, km: { title: "T", description: "D" } };
  const check = (change: object) => rejected(settingsInput, { socials, seo, ...change });
  const withSocial = (index: number, change: object) => socials.map((s, i) => (i === index ? { ...s, ...change } : s));

  test("social links", () => {
    assert.deepEqual(check({}), []);
    assert.deepEqual(check({ socials: withSocial(1, { href: "http://insecure.example" }) }), ["socials.1.href"]);
    assert.deepEqual(check({ socials: withSocial(2, { href: "" }) }), [], "an empty link removes it");
    assert.deepEqual(check({ socials: [...socials.slice(0, 3), socials[0]] }), ["socials"]);
    assert.deepEqual(check({ socials: withSocial(3, { platform: "TikTok" }) }), ["socials.3.platform"]);
  });

  test("SEO text", () => {
    assert.deepEqual(check({ seo: { en: seo.en, km: { title: "T", description: "" } } }), ["seo.km.description"]);
    assert.deepEqual(check({ seo: { en: { title: "x".repeat(71), description: "D" }, km: seo.km } }), ["seo.en.title"]);
  });
});
