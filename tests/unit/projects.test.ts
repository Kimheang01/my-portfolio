import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { missingLocales, projectInput } from "@/modules/projects/schema";
import { rejected } from "./helpers";

const text = { title: "T", type: "Web app", context: "Uni · 2025", description: "D" };
const blank = { title: "", type: "", context: "", description: "" };
const project = {
  slug: "my-app",
  color: "#2563EB",
  monogram: "",
  href: "",
  repo: "",
  tags: " React,  Expo ,React,",
  logoMediaId: null,
  imageMediaId: 3,
  status: "draft",
  translations: { en: text, km: text },
};
const check = (change: object) => rejected(projectInput, { ...project, ...change });

describe("project form", () => {
  test("a draft may have no Khmer text", () => {
    assert.deepEqual(check({}), []);
    assert.deepEqual(check({ translations: { en: text, km: blank } }), []);
  });

  test("publishing needs every text in every language", () => {
    assert.deepEqual(check({ status: "published" }), []);
    assert.deepEqual(check({ status: "published", translations: { en: text, km: { ...text, title: "", description: " " } } }), [
      "translations.km.description",
      "translations.km.title",
    ]);
    assert.deepEqual(check({ translations: { en: text } }), ["translations.km"]);
  });

  test("slug: lowercase words joined by single hyphens", () => {
    for (const slug of ["My App", "my--app", "-my-app", "  "]) assert.deepEqual(check({ slug }), ["slug"], slug);
  });

  test("color must be exactly #rrggbb (the card adds alpha digits)", () => {
    for (const color of ["#abc", "#2563eb80", "blue"]) assert.deepEqual(check({ color }), ["color"], color);
  });

  test("links must be https", () => {
    assert.deepEqual(check({ href: "http://example.com" }), ["href"]);
    assert.deepEqual(check({ repo: "javascript:alert(1)" }), ["repo"]);
    assert.deepEqual(check({ href: "https://example.com/x" }), []);
  });

  test("other limits", () => {
    assert.deepEqual(check({ monogram: "ABCD" }), ["monogram"]);
    assert.deepEqual(check({ status: "deleted" }), ["status"]);
    assert.deepEqual(check({ tags: Array.from({ length: 13 }, (_, i) => `t${i}`).join(",") }), ["tags"]);
    assert.deepEqual(check({ logoMediaId: "1; drop table media" }), ["logoMediaId"]);
    assert.deepEqual(check({ imageMediaId: -1 }), ["imageMediaId"]);
    assert.deepEqual(check({ translations: { en: { ...text, title: "x".repeat(81) }, km: text } }), ["translations.en.title"]);
  });

  test("saved values are cleaned up", () => {
    const saved = projectInput.parse(project);
    assert.equal(saved.color, "#2563eb");
    assert.deepEqual(saved.tags, ["React", "Expo"]);
    assert.equal(saved.href, null);
    assert.equal(saved.monogram, null);
  });

  test("missingLocales marks a language with empty text", () => {
    assert.deepEqual(missingLocales({ en: text, km: { ...text, type: " " } }), ["km"]);
  });
});
