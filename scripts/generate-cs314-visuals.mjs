#!/usr/bin/env node

// Adds original-PDF visual excerpts to archived CS 314 questions. PDF text
// extraction loses the spatial relationship between nodes and links, so the
// archived question keeps a faithful visual reference for every page that
// explicitly introduces a diagram. Hand-curated SVG trees take precedence.

import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archivePath = path.join(repoRoot, "app", "data", "generated-cs-archive.ts");
const outputRoot = path.join(repoRoot, "public", "exam-visuals", "cs314");
const rasterScale = 144;
const pageWidth = 1224;
const pageHeight = 1584;

const visualCue =
  /(?:draw|drawing|diagram|figure|shown\s+(?:above|below|to\s+the\s+(?:right|left))|(?:following|given|consider)\s+(?:the\s+)?.{0,45}\b(?:tree|graph|heap|linked structure|matrix|hash table|trie)\b|\b(?:tree|graph|heap|linked structure|matrix|hash table|trie)\b.{0,55}(?:above|below|to\s+the\s+(?:right|left)|shown))/is;

function archiveValue(source) {
  return JSON.parse(source.replace(/^.*?= /s, "").replace(/;\s*$/, ""));
}

function currentQuestionNumber(page, previous) {
  const headings = [...page.matchAll(/^\s*(\d{1,2})\.\s+.+?(?:\(|\b)\s*\d+(?:\.\d+)?\s*(?:points?|pts?)/gim)];
  return headings.length ? Number(headings.at(-1)[1]) : previous;
}

function hasVisualCue(page) {
  return visualCue.test(page);
}

function renderPage(pdfPath, outputPath, page) {
  const prefix = outputPath.slice(0, -4);
  execFileSync("pdftoppm", ["-f", String(page), "-l", String(page), "-r", String(rasterScale), "-png", "-singlefile", pdfPath, prefix], {
    stdio: "ignore",
  });
}

const source = await readFile(archivePath, "utf8");
const prefix = source.match(/^[\s\S]*?= /)?.[0];
if (!prefix) throw new Error("Could not locate generated archive assignment.");
const archive = archiveValue(source);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });
let visualCount = 0;

for (const exam of Object.values(archive)) {
  if (exam.course !== "CS 314") continue;
  for (const question of exam.questions) {
    question.diagrams = question.diagrams?.filter((diagram) => diagram.kind !== "source");
  }
  const sourceFile = exam.sourceFiles?.find((file) => file.role === "exam")?.path;
  if (!sourceFile) continue;
  const pdfPath = path.join(repoRoot, sourceFile);
  const pages = execFileSync("pdftotext", ["-layout", pdfPath, "-"], { encoding: "utf8" }).split("\f");
  let activeQuestion = 1;

  for (const [pageIndex, page] of pages.entries()) {
    activeQuestion = currentQuestionNumber(page, activeQuestion);
    if (!hasVisualCue(page)) continue;
    const question = exam.questions[activeQuestion - 1];
    if (!question) continue;
    const fileName = `${exam.id}-q${activeQuestion}-p${pageIndex + 1}.png`;
    const target = path.join(outputRoot, fileName);
    renderPage(pdfPath, target, pageIndex + 1);
    question.diagrams ??= [];
    question.diagrams.push({
      kind: "source",
      src: `/exam-visuals/cs314/${fileName}`,
      alt: `Official source-page visual for ${exam.title}, question ${activeQuestion}, page ${pageIndex + 1}.`,
      title: "Original exam visual",
      description: "The diagram is shown from the official exam page so node positions and connections remain unambiguous.",
      width: pageWidth,
      height: pageHeight,
    });
    visualCount += 1;
  }
}

await writeFile(archivePath, `${prefix}${JSON.stringify(archive, null, 2)};\n`);
console.log(`Added ${visualCount} official CS 314 source-page visuals.`);
