#!/usr/bin/env node

// Applies only safe field-level CS 314 overrides to the already generated
// archive. This is useful on machines without pdftotext; structural overrides
// still require the full generate:archive pipeline.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cs314Overrides } from "./curation/cs314-overrides.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archivePath = path.join(repoRoot, "app", "data", "generated-cs-archive.ts");
const source = await readFile(archivePath, "utf8");
const prefix = source.match(/^[\s\S]*?= /)?.[0];
if (!prefix) throw new Error("Could not locate generated archive assignment.");
const archive = JSON.parse(source.slice(prefix.length).replace(/;\s*$/, ""));

let applied = 0;
for (const [examId, examOverride] of Object.entries(cs314Overrides)) {
  const exam = archive[examId];
  if (!exam) throw new Error(`Unknown CS 314 override exam ${examId}.`);
  for (const [number, questionOverride] of Object.entries(examOverride.questions ?? {})) {
    if (!questionOverride.set) continue;
    const question = exam.questions[Number(number) - 1];
    if (!question) throw new Error(`${examId} has no question ${number}.`);
    Object.assign(question, questionOverride.set);
    applied++;
  }
}

await writeFile(archivePath, `${prefix}${JSON.stringify(archive, null, 2)};\n`);
console.log(`Applied ${applied} field-level CS 314 curation overrides.`);
