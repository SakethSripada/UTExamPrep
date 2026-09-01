// Generates runner/questions/<id>/ template directories from
// harness-fixtures.json + solutions.json. Each template is the exact harness
// file set with the reference solution replaced by the student-code marker, so
// the Go harness reproduces the original TypeScript harness byte-for-byte.
// Run from the repo root:  node runner/testdata/generate-question-templates.mjs
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const MARKER = "// __STUDENT_CODE__";

const here = import.meta.dirname;
const fixtures = JSON.parse(readFileSync(path.join(here, "harness-fixtures.json"), "utf8"));
const solutions = JSON.parse(readFileSync(path.join(here, "solutions.json"), "utf8"));

// Mirrors the declassify transform applied by the harness to critter-style
// whole-class questions (JS String.replace with a non-global regex replaces
// only the first match).
function declassify(code) {
  return code.replace(/public\s+class\s+(Yak|JumpingBean)\b/, "class $1");
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let from = 0;
  while (true) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return count;
    count++;
    from = at + needle.length;
  }
}

const questionsRoot = path.join(here, "..", "questions");
rmSync(questionsRoot, { recursive: true, force: true });

for (const id of Object.keys(fixtures).sort()) {
  const files = fixtures[id];
  const raw = solutions[id];
  if (!raw) throw new Error(`No solution for ${id}`);

  let embedded = raw;
  let transform = null;
  if (countOccurrences(Object.values(files).join("\0"), raw) === 0) {
    embedded = declassify(raw);
    transform = "declassify";
  }

  const total = Object.values(files).reduce((sum, content) => sum + countOccurrences(content, embedded), 0);
  if (total !== 1) {
    throw new Error(`${id}: expected the solution to appear exactly once across harness files, found ${total}`);
  }

  const dir = path.join(questionsRoot, id);
  mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(path.join(dir, name), content.replace(embedded, MARKER));
  }
  if (transform) {
    writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({ transform }, null, 2) + "\n");
  }
  console.log(`${id}${transform ? ` (${transform})` : ""}`);
}
console.log("done");
