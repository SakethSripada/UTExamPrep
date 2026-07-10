#!/usr/bin/env node

// Builds app/data/generated-cs-archive.ts and generated-cs-catalog.ts from the
// archived exam PDFs in exampdfs/.
//
// CS 314 exams are parsed from the PDFs (scripts/lib/cs314-parser.mjs) and then
// patched by the hand-curated fixes in scripts/curation/cs314-overrides.mjs —
// diagrams transcribed from page images, two-column key repairs, and wording
// cleanups live there. CS 439 exams vary too much to parse and are digitized by
// hand in scripts/curation/cs439-exams.mjs.
//
// Run with --report to list every warning the parser produced (each one is a
// spot where the output relies on an override or needs review).

import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractPdf, fixLostSuperscripts } from "./lib/pdf-text.mjs";
import {
  chunkLines,
  cleanSectionLines,
  extractPrePost,
  extractSignatureBlocks,
  keyCellToAnswer,
  looksLikeCodeLine,
  parseAnswerKey,
  parseRubric,
  parseShortAnswerParts,
  pointsFromHeading,
  renderChunks,
  SHORT_ANSWER_PROMPT,
  splitExamQuestions,
  splitSolutionSections,
} from "./lib/cs314-parser.mjs";
import { cs314Overrides } from "./curation/cs314-overrides.mjs";
import { cs439Exams } from "./curation/cs439-exams.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(repoRoot, "exampdfs");
const dataRoot = path.join(repoRoot, "app", "data");
const showReport = process.argv.includes("--report");

const warnings = new Map();
function warnFor(examId) {
  return (message) => {
    if (!warnings.has(examId)) warnings.set(examId, []);
    warnings.get(examId).push(message);
  };
}

function titleCase(value) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayTerm(term) {
  const [year, season] = term.split("-");
  return season ? `${titleCase(season)} ${year}` : year;
}

function examTypeFromKey(key) {
  if (key === "final") return "Final Exam";
  if (key === "exam") return "Midterm";
  const number = key.match(/\d+/)?.[0];
  return number ? `Exam ${number}` : "Exam";
}

async function sourceFilesFor(courseKey) {
  const courseDir = path.join(sourceRoot, courseKey);
  const terms = (await readdir(courseDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const results = [];
  for (const term of terms) {
    if (courseKey === "cs314" && term === "2025-fall") continue;
    const dir = path.join(courseDir, term);
    const names = (await readdir(dir)).filter((name) => name.endsWith(".pdf")).sort();
    for (const name of names) {
      const match = name.match(/^(exam(?:-[123])?|final)-exam-/);
      if (!match) continue;
      const key = match[1];
      const solutionCandidates = names.filter((candidate) => candidate.startsWith(`${key}-solution-`));
      const solutionName = solutionCandidates.find((candidate) => !candidate.includes("alternate")) ?? solutionCandidates[0];
      if (!solutionName) throw new Error(`Missing solution PDF for ${path.join(courseKey, term, name)}`);
      results.push({
        courseKey,
        term,
        key,
        examPath: path.join(dir, name),
        solutionPath: path.join(dir, solutionName),
      });
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Question 1 (short answer)
// ---------------------------------------------------------------------------

const KNOWN_INTRO_RULES =
  /(compile error|runtime error|infinite loop|most restrictive|answer sheet|attached|closest without going under|selection sort has an average|big o|place your? answers?)/i;

function buildShortQuestion({ id, section, solutionSection, warn, fullSolutionText, firstSolutionSectionStart = -1 }) {
  const { total, each } = pointsFromHeading(section.heading);
  const parsed = parseShortAnswerParts(section.lines, warn);

  // Anything in the intro that is not one of the standard boilerplate rules is
  // exam-specific and belongs in the prompt.
  const extraIntro = renderChunks(chunkLines(cleanSectionLines(parsed.introLines)))
    .split("\n")
    .map((line) => line.replace(/^[a-e]\.\s+/, "").trim())
    .filter((line) => line && !KNOWN_INTRO_RULES.test(line) && !looksLikeCodeLine(line));

  // Answer key: prefer the numbered solution section, fall back to a filled
  // answer sheet at the end of the solution document.
  let keyLines = solutionSection?.lines ?? [];
  let cells = parseAnswerKey(keyLines, () => {});
  if (!cells.size) {
    const solutionLines = fullSolutionText.split("\n");
    const sheetIndex = solutionLines.findIndex((line) => /Question 1 Answer Sheet/i.test(line));
    if (sheetIndex !== -1) {
      cells = parseAnswerKey(solutionLines.slice(sheetIndex + 1), warn);
    }
  }
  if (!cells.size && firstSolutionSectionStart > 0) {
    // Some finals put the lettered key at the very top of the solution file
    // with no "1." heading at all.
    cells = parseAnswerKey(fullSolutionText.split("\n").slice(0, firstSolutionSectionStart), () => {});
  }
  if (!cells.size) warn("question 1: no answer key found");

  const keyPreamble = (solutionSection?.lines ?? [])
    .slice(0, 12)
    .map((line) => line.trim())
    .filter((line) => /answers? as shown|as written|points? off|partial credit|no points off|not required|grading guidance/i.test(line))
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\d+\.\s*/, "");

  const codeBlocks = [];
  const answers = [];
  const answerPoints = [];
  const perPartNotes = [];

  for (const segment of parsed.segments) {
    if (segment.kind === "context") {
      codeBlocks.push(segment.text);
      continue;
    }
    const letter = segment.letter;
    const cell = cells.get(letter);
    if (!cell) {
      warn(`question 1 part ${letter}: no answer in key`);
      codeBlocks.push(`${letter}. ${segment.text}`);
      answers.push("");
      answerPoints.push(each ?? 2);
      continue;
    }
    const { answer, notes, subAnswers } = keyCellToAnswer(letter, cell);
    if (subAnswers && subAnswers.length > 1) {
      // Split the exam part into sub-parts: statements tagged "// J.1" style,
      // or failing that, the code-looking lines.
      const partLines = segment.text.split("\n");
      const tagged = partLines.filter((line) => new RegExp(`//\\s*${letter}\\s*\\.?\\s*\\d`).test(line));
      const statements = tagged.length ? tagged : partLines.filter((line) => looksLikeCodeLine(line));
      const prose = partLines.filter((line) => !statements.includes(line));
      if (statements.length === subAnswers.length) {
        statements.forEach((statement, subIndex) => {
          const label = `${letter}${subIndex + 1}`;
          const cleaned = statement.replace(new RegExp(`//\\s*${letter}\\s*\\.?\\s*\\d\\s*$`), "").trimEnd();
          const intro = subIndex === 0 && prose.length ? `${prose.join("\n")}\n` : "";
          codeBlocks.push(`${label}. ${intro}${cleaned}`);
          answers.push(subAnswers[subIndex]);
          answerPoints.push((each ?? 2) / subAnswers.length);
        });
        if (notes.length) perPartNotes.push(notes.join(" | "));
        continue;
      }
      if (statements.length > 0) {
        warn(`question 1 part ${letter}: key has ${subAnswers.length} sub-answers but part has ${statements.length} statements`);
      }
      // A prose part whose official answer is an enumerated list stays one
      // part; the enumeration is simply the expected answer.
      codeBlocks.push(`${letter}. ${segment.text}`);
      answers.push(subAnswers.join("; "));
      answerPoints.push(each ?? 2);
      if (notes.length) perPartNotes.push(notes.join(" | "));
      continue;
    }
    codeBlocks.push(`${letter}. ${segment.text}`);
    answers.push(answer);
    answerPoints.push(each ?? 2);
    if (notes.length) perPartNotes.push(notes.join(" | "));
  }

  if (answers.some((answer) => !answer)) warn("question 1: some parts have empty answers");
  const points = total ?? answerPoints.reduce((sum, value) => sum + value, 0);
  const pointsSum = answerPoints.reduce((sum, value) => sum + value, 0);
  if (total && pointsSum !== total) {
    warn(`question 1: part points sum ${pointsSum} != declared total ${total}`);
  }

  const officialSolutionParts = [];
  if (keyPreamble) officialSolutionParts.push(keyPreamble);
  if (perPartNotes.length) {
    officialSolutionParts.push(`Grading notes: ${perPartNotes.join(" | ")}`);
  }

  const prompt = [SHORT_ANSWER_PROMPT, ...extraIntro].join(" ");

  return {
    id,
    title: "1. Short Answer",
    points,
    type: "short",
    prompt,
    code: codeBlocks.join("\n").replace(/\n{3,}/g, "\n\n"),
    answers,
    answerPoints,
    ...(officialSolutionParts.length ? { officialSolution: officialSolutionParts.join("\n") } : {}),
  };
}

// ---------------------------------------------------------------------------
// Programming questions
// ---------------------------------------------------------------------------

const RESTRICTION_START =
  /^(You may not|You may only|You are not allowed|You may use|You may call|You may assume|You can use|Do not|Your method (must|shall)|Your solution (must|shall)|The only (other )?methods?|Recall that since this method)/i;

function topicFromHeading(heading) {
  let topic = heading
    .replace(/\((\d+(?:\.\d+)?)\s*points?[^)]*\)/gi, "")
    .replace(/[-,]?\s*\d+\s*points?\s*(total)?\.?/gi, "")
    .replace(/\(\s*\)/g, "")
    .trim();
  // The description sentence often starts right in the heading; cut it off.
  const verb = topic.search(/\b(Complete|Write|Implement|Create|Finish|Design)\b/);
  if (verb > 0) topic = topic.slice(0, verb);
  topic = (topic.split(/(?<=[.!?])\s/)[0] ?? topic).split(/\s{2,}/)[0]
    .replace(/^The\s+/i, "")
    .replace(/\s+class\.?$/i, "")
    .replace(/^[([\s]+/, "")
    .replace(/[\s.:,()[\]-]+$/, "")
    .trim();
  if (topic.length > 40) topic = topic.split(/[,.]/)[0].trim();
  return topic || "Programming";
}

function headingRemainder(heading) {
  // The heading line often starts the description ("2. Lists. (14 points) To
  // demonstrate encapsulation...") - keep the part after the points marker.
  const marker = heading.match(/\d+(?:\.\d+)?\s*(?:points?|pts?)(?:\s+total)?/i);
  if (!marker) return "";
  return heading
    .slice(marker.index + marker[0].length)
    .replace(/^[).\s:-]+/, "")
    .trim();
}

function buildProgrammingQuestion({ id, courseId, section, solutionSection, warn, fullSolutionText }) {
  const { total } = pointsFromHeading(section.heading);
  if (!total) warn(`question ${section.number}: no points found in heading`);

  const bodyLines = cleanSectionLines(section.lines.slice(1));
  const remainder = headingRemainder(section.heading);
  if (remainder) bodyLines.unshift(remainder);

  // The exam repeats the method-to-complete signature at the end as the answer
  // area; use it for the stub, then drop it (and the "Complete the following
  // ..." lead-in) from the reference.
  const signatureBlocks = extractSignatureBlocks(bodyLines);
  const target = signatureBlocks.at(-1) ?? null;
  let stub = null;
  let methodName = null;
  let prePost = { pre: undefined, post: undefined };
  let referenceEnd = bodyLines.length;
  if (target) {
    methodName = target.name;
    prePost = extractPrePost(target.commentLines);
    for (const block of signatureBlocks) {
      if (block.name === target.name && !prePost.pre) {
        prePost = extractPrePost(block.commentLines);
      }
    }
    const preLine = prePost.pre ? `// pre: ${prePost.pre}` : null;
    const shortPost = prePost.post && prePost.post.length <= 70 ? prePost.post : "Per the problem description.";
    const postLine = `// post: ${shortPost}`;
    stub = [preLine, postLine, `${target.signature} {`].filter(Boolean).concat(["", "}"]).join("\n");
    referenceEnd = target.start;
    // Also strip a "Complete the following instance method..." lead-in.
    for (let index = target.start - 1; index >= Math.max(0, target.start - 4); index -= 1) {
      if (/^Complete the (following|instance|method)/i.test(bodyLines[index]?.trim() ?? "")) {
        referenceEnd = index;
        break;
      }
      if (bodyLines[index]?.trim()) break;
    }
  } else {
    warn(`question ${section.number}: no method signature found`);
  }

  // Split the remaining body into description (prompt) and reference material.
  // Duplicate declarations of the target method (the "method header is:" block
  // repeated mid-question) collapse to the single pre/post tail added below.
  const skip = new Set();
  if (target) {
    for (const block of signatureBlocks) {
      if (block === target || block.name !== target.name) continue;
      if (block.end >= referenceEnd) continue;
      for (let index = block.start; index <= block.end; index += 1) skip.add(index);
      for (let index = block.start - 1; index >= Math.max(0, block.start - 3); index -= 1) {
        const trimmed = bodyLines[index]?.trim() ?? "";
        if (!trimmed) continue;
        if (/^(The method (header|signature)|The instance method|Complete the (following|instance|method))/i.test(trimmed)) skip.add(index);
        break;
      }
    }
  }
  const referenceLines = bodyLines.slice(0, referenceEnd).filter((_, index) => !skip.has(index));
  const chunks = chunkLines(referenceLines);
  const promptParagraphs = [];
  const referenceBlocks = [];
  let restrictionBullets = null;
  let exampleGroup = null;
  let inPrompt = true;

  const isExampleLine = (value) =>
    /^\[/.test(value) || /(\]|\))\s*\.\w+\(.*\)/.test(value) || (/returns\b/.test(value) && /[[\]]/.test(value));
  // Split a paragraph into restriction bullets at sentence boundaries where a
  // new restriction sentence begins ("You may not ... . You may use ...").
  const restrictionSentences = (paragraph) => {
    const sentences = paragraph.split(/(?<=\.)\s+(?=[A-Z])/);
    const bullets = [];
    for (const sentence of sentences) {
      if (!bullets.length || RESTRICTION_START.test(sentence)) bullets.push(sentence.trim());
      else bullets[bullets.length - 1] += ` ${sentence.trim()}`;
    }
    return bullets;
  };

  for (const chunk of chunks) {
    if (chunk.kind === "code") {
      inPrompt = false;
      exampleGroup = null;
      referenceBlocks.push(renderChunks([chunk]));
      continue;
    }
    const paragraphs = renderChunks([chunk]).split("\n");
    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;
      const isRestriction = RESTRICTION_START.test(paragraph);
      const isStructural =
        /^(The method (header|signature)|The instance method|Recall|Here (is|are)|The properties of|Examples?\b|Consider (this|the following)|Given the above)/i.test(
          paragraph,
        );
      if (inPrompt && !isRestriction && !isStructural && !isExampleLine(paragraph)) {
        promptParagraphs.push(paragraph);
        continue;
      }
      inPrompt = false;
      if (isRestriction) {
        exampleGroup = null;
        if (!restrictionBullets) {
          restrictionBullets = [];
          referenceBlocks.push(restrictionBullets);
        }
        for (const bullet of restrictionSentences(paragraph)) restrictionBullets.push(`- ${bullet}`);
        continue;
      }
      if (/^The method (header|signature)/i.test(paragraph) || /^The instance method/i.test(paragraph)) {
        continue; // The signature itself follows as a code chunk.
      }
      if (/^Examples?\b/i.test(paragraph) && paragraph.length < 90) {
        exampleGroup = ["Examples:"];
        referenceBlocks.push(exampleGroup);
        continue;
      }
      if (isExampleLine(paragraph)) {
        if (!exampleGroup) {
          exampleGroup = ["Examples:"];
          referenceBlocks.push(exampleGroup);
        }
        exampleGroup.push(paragraph);
        continue;
      }
      exampleGroup = null;
      referenceBlocks.push(paragraph);
    }
  }

  if (!promptParagraphs.length) warn(`question ${section.number}: empty prompt after parsing`);

  const referenceText = referenceBlocks
    .map((block) => {
      if (!Array.isArray(block)) return block;
      if (block[0] === "Examples:") return block.length > 1 ? block.join("\n") : "";
      return `Restrictions:\n${block.join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");
  const prePostTail = [
    prePost.pre ? `// pre: ${prePost.pre}` : null,
    prePost.post ? `// post: ${prePost.post}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Solution: suggested code plus rubric from the grading criteria. When the
  // solution document has no numbered section for this question (finals often
  // use ad-hoc headers), fall back to locating the method by name anywhere in
  // the document.
  let answer = null;
  let rubric = [];
  let effectiveSection = solutionSection;
  if (!effectiveSection && methodName && fullSolutionText) {
    const allLines = fullSolutionText.split("\n");
    const start = allLines.findIndex((line) =>
      new RegExp(`^\\s*(public|private|protected).*\\b${methodName}\\s*\\(`).test(line),
    );
    if (start !== -1) {
      let end = allLines.length;
      for (let index = start + 1; index < allLines.length; index += 1) {
        if (/^\s{0,2}\d{1,2}\.\s+\S/.test(allLines[index]) || /^[A-Z ]{4,}$/.test(allLines[index].trim())) {
          end = index;
          break;
        }
      }
      // Include a leading "Suggested Solution" style header if present.
      effectiveSection = { lines: ["Suggested Solution:", ...allLines.slice(start, end)] };
    }
  }
  if (effectiveSection) {
    const solutionLines = cleanSectionLines(effectiveSection.lines);
    const suggestedIndex = solutionLines.findIndex((line) =>
      /^(\d{1,2}\.\s*)?(Suggested|One possible|Possible|Sample) solutions?\b.{0,24}$/i.test(line.trim()),
    );
    const criteriaIndex = solutionLines.findIndex((line) =>
      /((General )?Grading [Cc]riteria|^\d+\s*points?\s*,?\s*Criteria:?|^Criteria:)/i.test(line.trim()),
    );
    let solutionStart = suggestedIndex !== -1 ? suggestedIndex + 1 : -1;
    if (solutionStart === -1 && methodName) {
      solutionStart = solutionLines.findIndex((line) =>
        new RegExp(`^\\s*(public|private|protected).*\\b${methodName}\\s*\\(`).test(line),
      );
    }
    if (solutionStart !== -1) {
      const solutionEnd = criteriaIndex > solutionStart ? criteriaIndex : solutionLines.length;
      const candidate = solutionLines.slice(solutionStart, solutionEnd);
      const commonIndex = candidate.findIndex((line) => /^Common problems/i.test(line.trim()));
      answer = renderChunks(chunkLines(commonIndex === -1 ? candidate : candidate.slice(0, commonIndex))).trim();
    }
    if (!answer) {
      // Newer solutions drop the header and signature entirely: the solution is
      // the first substantial code block after the comments.
      const solutionEnd = criteriaIndex !== -1 ? criteriaIndex : solutionLines.length;
      const chunks = chunkLines(solutionLines.slice(1, solutionEnd));
      const firstCode = chunks.findIndex((chunk) => chunk.kind === "code" && chunk.lines.filter((line) => line.trim()).length >= 3);
      if (firstCode !== -1) {
        const commonIndex = chunks.findIndex(
          (chunk, chunkIndex) => chunkIndex > firstCode && chunk.kind === "text" && /^Common problems/i.test(chunk.lines[0]?.trim() ?? ""),
        );
        answer = renderChunks(chunks.slice(firstCode, commonIndex === -1 ? undefined : commonIndex)).trim();
      }
    }
    if (criteriaIndex !== -1) {
      rubric = parseRubric(solutionLines.slice(criteriaIndex + 1), warn).map((item) => ({
        label: item.label,
        points: item.points,
      }));
    }
    if (!answer) warn(`question ${section.number}: no suggested solution extracted`);
  } else {
    warn(`question ${section.number}: no solution section`);
  }

  const points = total ?? rubric.reduce((sum, item) => sum + item.points, 0) ?? 0;
  // The instructor's own criteria sheets do not always sum exactly to the
  // question total; only a large gap suggests the parse went wrong.
  const rubricSum = rubric.reduce((sum, item) => sum + item.points, 0);
  if (rubric.length && total && (rubricSum < total * 0.6 || rubricSum > total * 1.35)) {
    warn(`question ${section.number}: rubric sums to ${rubricSum}, question is ${total} points`);
  }
  if (!rubric.length) {
    rubric = [{ label: "Compare correctness, completeness, restrictions, and edge cases with the official solution", points }];
  }

  const topic = topicFromHeading(section.heading);
  return {
    id,
    title: `${section.number}. ${topic}${methodName ? ` - ${methodName}` : ""}`,
    points,
    type: "code",
    language: "java",
    prompt: promptParagraphs.join(" "),
    reference: [referenceText, prePostTail].filter(Boolean).join("\n\n"),
    stub: stub ?? "// Write your Java solution here.\n",
    answer: answer ?? "",
    runnable: false,
    rubric,
  };
}

// ---------------------------------------------------------------------------
// Exam assembly + overrides
// ---------------------------------------------------------------------------

function applyQuestionOverride(question, override, warn) {
  if (!override) return question;
  const result = { ...question, ...override.set };
  if (override.parts || override.partAnswers || override.removeParts) {
    // Patch individual lettered parts inside a short question.
    const lines = result.code.split("\n");
    // Rebuild parts map.
    const partIndex = new Map();
    lines.forEach((line, index) => {
      const match = line.match(/^([A-Z](?:\d+)?)\.\s/);
      if (match) partIndex.set(match[1], index);
    });
    if (override.parts) {
      for (const [label, text] of Object.entries(override.parts)) {
        if (!partIndex.has(label)) {
          warn(`override part ${label} not found in ${question.id}`);
          continue;
        }
        const start = partIndex.get(label);
        let end = lines.length;
        for (const [otherLabel, otherIndex] of partIndex) {
          if (otherIndex > start && otherIndex < end) end = otherIndex;
        }
        lines.splice(start, end - start, `${label}. ${text}`);
        // Rebuild indices after splice.
        partIndex.clear();
        lines.forEach((value, index) => {
          const match = value.match(/^([A-Z](?:\d+)?)\.\s/);
          if (match) partIndex.set(match[1], index);
        });
      }
      result.code = lines.join("\n");
    }
    if (override.partAnswers) {
      const labels = [...result.code.matchAll(/^([A-Z](?:\d+)?)\.\s/gm)].map((match) => match[1]);
      for (const [label, answer] of Object.entries(override.partAnswers)) {
        const index = labels.indexOf(label);
        if (index === -1) {
          warn(`override answer for missing part ${label} in ${question.id}`);
          continue;
        }
        result.answers = [...result.answers];
        result.answers[index] = answer;
      }
    }
  }
  return result;
}

function buildCs314Exam(source) {
  const term = displayTerm(source.term);
  const examType = examTypeFromKey(source.key);
  const suffix = source.key === "exam" ? "midterm" : source.key;
  const id = `cs314-${source.term}-${suffix}`;
  const warn = warnFor(id);

  const examText = extractPdf(source.examPath);
  const solutionText = extractPdf(source.solutionPath);
  const sections = splitExamQuestions(examText);
  if (!sections.length) throw new Error(`No questions found in ${source.examPath}`);
  const solutionSections = splitSolutionSections(solutionText, sections.length, warn);

  // Content that references a drawing needs a human transcription pass.
  for (const section of sections) {
    const text = section.lines.join("\n");
    if (/(shown|tree|figure|diagram|matrix|graph|heap|table) (above|below|to the (right|left))/i.test(text) || /tree is:\s*$/im.test(text)) {
      const override = cs314Overrides[id]?.questions?.[section.number];
      if (!override) warn(`question ${section.number}: references a drawing; needs diagram review`);
    }
  }

  const override = cs314Overrides[id] ?? {};
  const questions = sections.map((section) => {
    const questionId = `${id}-q${section.number}`;
    const questionOverride = override.questions?.[section.number];
    if (questionOverride?.replace) {
      return { id: questionId, ...questionOverride.replace };
    }
    const solutionSection = solutionSections.get(section.number);
    const base =
      section.number === 1 && !questionOverride?.forceCode
        ? buildShortQuestion({ id: questionId, section, solutionSection, warn, fullSolutionText: solutionText, firstSolutionSectionStart: Math.min(...[...solutionSections.values()].map((value) => value.start), Number.MAX_SAFE_INTEGER) })
        : buildProgrammingQuestion({ id: questionId, courseId: id, section, solutionSection, warn, fullSolutionText: solutionText });
    const patched = applyQuestionOverride(base, questionOverride, warn);
    patched.sourceNote = `${path.relative(repoRoot, source.examPath)}, question ${section.number}`;
    return patched;
  });

  const topics = questions
    .filter((question) => question.type === "code")
    .map((question) => question.title.replace(/^\d+\.\s*/, "").split(" - ")[0])
    .filter((value, index, array) => array.indexOf(value) === index);
  const subtitle =
    override.subtitle ??
    (topics.length ? `Short answer plus ${topics.join(", ")}` : "Official archived data structures exam with paired solutions");

  return {
    id,
    title: `CS 314 ${term} ${examType}`,
    subtitle,
    course: "CS 314",
    subject: "Computer Science",
    term,
    examType,
    sourceNotice: "Digitized from the official exam and paired official solution PDFs in the UT CS archive.",
    sourceFiles: [
      { label: "Official exam PDF", path: path.relative(repoRoot, source.examPath), role: "exam" },
      { label: "Official solution PDF", path: path.relative(repoRoot, source.solutionPath), role: "solution" },
    ],
    questions,
  };
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const cs314Sources = await sourceFilesFor("cs314");
const exams = cs314Sources.map(buildCs314Exam);

for (const exam of Object.values(cs439Exams)) {
  exams.push(exam);
}

const archive = Object.fromEntries(exams.map((exam) => [exam.id, exam]));
const catalog = exams.map((exam) => ({
  id: exam.id,
  title: exam.title,
  subtitle: exam.subtitle,
  course: exam.course,
  subject: exam.subject,
  term: exam.term,
  examType: exam.examType,
  questionCount: exam.questions.length,
  points: exam.questions.reduce((sum, question) => sum + question.points, 0),
  autoGraded: exam.questions.some((question) => question.type === "short" || question.type === "choice"),
  sourceNotice: exam.sourceNotice,
  status: "ready",
}));

await writeFile(
  path.join(dataRoot, "generated-cs-archive.ts"),
  `// Generated by scripts/generate-cs-archive.mjs. Do not edit by hand: parser fixes\n// belong in scripts/lib/, content fixes in scripts/curation/.\nimport type { Exam } from "@/app/lib/exam-types";\n\nexport const archivedCsExams: Record<string, Exam> = ${JSON.stringify(archive, null, 2)};\n`,
);
await writeFile(
  path.join(dataRoot, "generated-cs-catalog.ts"),
  `// Generated by scripts/generate-cs-archive.mjs. Do not edit by hand: parser fixes\n// belong in scripts/lib/, content fixes in scripts/curation/.\nimport type { ExamCatalogEntry } from "@/app/lib/exam-types";\n\nexport const archivedCsCatalog: ExamCatalogEntry[] = ${JSON.stringify(catalog, null, 2)};\n`,
);

const warningCount = [...warnings.values()].reduce((sum, list) => sum + list.length, 0);
console.log(
  `Generated ${exams.length} archived exams with ${exams.reduce((sum, exam) => sum + exam.questions.length, 0)} questions (${warningCount} warnings).`,
);
if (showReport) {
  for (const [examId, list] of warnings) {
    console.log(`\n${examId}`);
    for (const message of list) console.log(`  - ${message}`);
  }
} else if (warningCount) {
  console.log("Run with --report to list warnings.");
}
