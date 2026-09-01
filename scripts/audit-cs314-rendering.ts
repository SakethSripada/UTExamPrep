#!/usr/bin/env tsx

import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { codeVocabulary, splitMixedContent } from "../app/components/mixed-content";
import type { Exam, Question } from "../app/lib/exam-types";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function generatedValue<T>(fileName: string): Promise<T> {
  const source = await readFile(path.join(repoRoot, "app", "data", fileName), "utf8");
  return JSON.parse(source.replace(/^[\s\S]*?= /, "").replace(/;\s*$/, "")) as T;
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

function assertKeywordsDoNotLeakIntoInlineProseVocabulary() {
  const vocabulary = codeVocabulary(splitMixedContent("for (int index = 0; index < limit; index++) total += index;"));
  assert(!vocabulary.has("for"), "The Java keyword 'for' must not be formatted as inline code in prose.");
  assert(vocabulary.has("index"), "Identifiers from a Java snippet should still be available for inline formatting.");
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
  assertKeywordsDoNotLeakIntoInlineProseVocabulary();

  const archive = await generatedValue<Record<string, Exam>>("generated-cs-archive.ts");
  let questionCount = 0;
  let programmingCount = 0;
  let mixedFieldCount = 0;
  let sourceVisualCount = 0;

  for (const exam of Object.values(archive).filter((item) => item.course === "CS 314")) {
    for (const question of exam.questions) {
      questionCount += 1;
      if (question.type === "code") programmingCount += 1;
      for (const diagram of question.diagrams ?? []) {
        if (diagram.kind === "source") {
          assert(diagram.src.startsWith("/"), `${question.id} has a malformed source visual path.`);
          await access(path.join(repoRoot, "public", diagram.src));
          sourceVisualCount += 1;
        }
        if (diagram.kind === "tree") {
          const ids = new Set(diagram.nodes.map((node) => node.id));
          assert(ids.has(diagram.root), `${question.id} tree diagram has no root node.`);
          for (const node of diagram.nodes) {
            assert(!node.left || ids.has(node.left), `${question.id} tree diagram references an unknown left child.`);
            assert(!node.right || ids.has(node.right), `${question.id} tree diagram references an unknown right child.`);
          }
        }
      }
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
    `Audited ${questionCount} CS 314 questions (${programmingCount} programming), ${mixedFieldCount} mixed prose/code fields, and ${sourceVisualCount} source visuals.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
