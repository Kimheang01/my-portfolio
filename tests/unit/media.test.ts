import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { isBlobUrl, registerInput } from "@/modules/media/schema";

describe("media", () => {
  test("only https URLs on Vercel Blob's public host count as Blob files", () => {
    assert.equal(isBlobUrl("https://abc123.public.blob.vercel-storage.com/portfolio/logo-x1.png"), true);
    for (const url of [
      "http://abc123.public.blob.vercel-storage.com/portfolio/logo.png",
      "https://evil.example/portfolio/logo.png",
      "https://public.blob.vercel-storage.com.evil.example/x.png",
      "https://abc.public.blob.vercel-storage.com.evil.example/x.png",
      "javascript:alert(1)",
      "not a url",
    ]) {
      assert.equal(isBlobUrl(url), false, url);
    }
  });

  test("a registered upload needs a URL and possible image sizes", () => {
    const url = "https://a.public.blob.vercel-storage.com/portfolio/x.png";
    assert.equal(registerInput.safeParse({ url, width: 640, height: 480 }).success, true);
    assert.equal(registerInput.safeParse({ url, width: null, height: null }).success, true);
    assert.equal(registerInput.safeParse({ url, width: 0, height: 50000 }).success, false);
    assert.equal(registerInput.safeParse({ url: "not a url", width: null, height: null }).success, false);
  });
});
