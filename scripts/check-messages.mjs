// Checks that every language in messages/ has exactly the same keys (and the
// same number of items in lists) as the English file. Run: yarn i18n:check
import fs from "node:fs";
import path from "node:path";

const dir = path.join(import.meta.dirname, "..", "messages");
const read = (file) => JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));

// Flattens { a: { b: ["x", "y"] } } into { "a.b": "array(2)", "a.b.0": "x", … }.
function flatten(value, prefix = "", out = {}) {
  if (Array.isArray(value)) out[prefix] = `array(${value.length})`;
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
  } else {
    out[prefix] = typeof value;
  }
  return out;
}

const source = flatten(read("en.json"));
let problems = 0;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "en.json")) {
  const target = flatten(read(file));
  const report = (message) => {
    problems++;
    console.error(`${file}: ${message}`);
  };
  for (const [key, type] of Object.entries(source)) {
    if (!(key in target)) report(`missing "${key}"`);
    else if (target[key] !== type) report(`"${key}" is ${target[key]}, expected ${type}`);
  }
  for (const key of Object.keys(target)) if (!(key in source)) report(`unused "${key}" (not in en.json)`);
}

if (problems) process.exit(1);
console.log("All message files have the same keys as en.json.");
