#!/usr/bin/env tsx

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { splitMixedContent } from "../app/components/mixed-content";
import type { Exam, Question } from "../app/lib/exam-types";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function generatedValue<T>(fileName: string): Promise<T> {
  const source = await readFile(path.join(repoRoot, "app", "data", fileName), "utf8");
  return JSON.parse(source.replace(/^.*?= /s, "").replace(/;\s*$/, "")) as T;
}

function assertUnclosedSnippetReturnsToProse() {
  const sample = `public class Decoder {
    private HuffCode[] codes;

Complete the decode method for the Decoder class. The method accepts a BitInputStream.

public int readBits(int howManyBits)
Returns the requested bits, or -1 if too few bits remain.`;
  const segments = splitMixedContent(sample);
  assert.deepEqual(
    segments.map((segment) => segment.kind),
    ["code", "text", "code", "text"],
    "An incomplete surrounding class must not absorb the instructions that follow it.",
  );
}

function assertNoInstructionLinesInCode(question: Question, field: string, content: string) {
  const instruction = /^(Complete|Do not|Each|None|Recall|Return|Returns|The method|This method|Use|When|Write|Writes|You)\b/;
  for (const segment of splitMixedContent(content)) {
    if (segment.kind !== "code") continue;
    let inBlockComment = false;
    const leaked = segment.text.split("\n").find((line) => {
      const trimmed = line.trim();
      const commentLine = inBlockComment || /^(\/\*|\*|\/\/)/.test(trimmed);
      if (trimmed.includes("/*") && !trimmed.includes("*/")) inBlockComment = true;
      if (trimmed.includes("*/")) inBlockComment = false;
      return (
        !commentLine &&
        instruction.test(trimmed) &&
        !/[;{}]$/.test(trimmed.replace(/\/\/.*$/, "").trimEnd())
      );
    });
    assert(!leaked, `${question.id} ${field} renders instructional prose as code: ${leaked}`);
  }
}

async function main() {
  assertUnclosedSnippetReturnsToProse();

  const archive = await generatedValue<Record<string, Exam>>("generated-cs-archive.ts");
  let questionCount = 0;
  let programmingCount = 0;
  let mixedFieldCount = 0;

  for (const exam of Object.values(archive).filter((item) => item.course === "CS 314")) {
    for (const question of exam.questions) {
      questionCount += 1;
      if (question.type === "code") programmingCount += 1;
      for (const [field, content] of [
        ["code", question.code],
        ["reference", question.reference],
        ["answer", question.answer],
        ["officialSolution", question.officialSolution],
      ] as const) {
        if (!content?.trim()) continue;
        const kinds = new Set(splitMixedContent(content).map((segment) => segment.kind));
        if (kinds.size > 1) mixedFieldCount += 1;
        assertNoInstructionLinesInCode(question, field, content);
      }
    }
  }

  console.log(
    `Audited ${questionCount} CS 314 questions (${programmingCount} programming) and ${mixedFieldCount} mixed prose/code fields.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
