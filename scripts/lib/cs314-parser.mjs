// Parser for archived CS 314 exams (Mike Scott format, 2011-2024).
//
// Every exam follows the same skeleton: question 1 is a multi-part short-answer
// question (lettered parts, each answered on an answer sheet) and the remaining
// questions are programming problems with a paired suggested solution and
// grading criteria in the solution PDF. This module turns the pdftotext output
// of an exam/solution pair into app Question objects; anything it cannot prove
// is reported as a warning so a human override can settle it.

import {
  isPageFurniture,
  isAnswerScaffolding,
  stripEmbeddedBlanks,
  normalizeInlineSpacing,
  fixLostSuperscripts,
} from "./pdf-text.mjs";

// ---------------------------------------------------------------------------
// Line classification (stricter than the app's renderer: PDF text hard-wraps
// sentences, so a line can begin with "class in Java, ..." mid-sentence.
// Keywords that read like prose (return/new/do/case) are excluded; real
// statements still end in ; or live inside brace/paren continuations.)
// ---------------------------------------------------------------------------

const CODE_KEYWORDS =
  /^(public|private|protected|static|final|abstract|if|else|for|while|switch|break|continue|try|catch|throw|void|int|long|double|float|boolean|char|struct|typedef|unsigned|#include|#define)\b/;

export function looksLikeCodeLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^(-|•)\s+/.test(trimmed)) return false;
  if (CODE_KEYWORDS.test(trimmed)) return true;
  if (/^(class|interface|enum)\s+[A-Z]/.test(trimmed)) return true;
  if (/^(new|return)\b.*[;{)]\s*$/.test(trimmed)) return true;
  const withoutComment = trimmed.replace(/\/\/.*$/, "").trimEnd();
  if (/^[}\])]/.test(trimmed) || /[;{}]$/.test(withoutComment)) return true;
  if (/^(\/\*|\*\/|\/\/|\*\s)/.test(trimmed)) return true;
  return false;
}

function netDelta(line, open, close) {
  const code = line.replace(/\/\/.*$/, "");
  let delta = 0;
  for (const char of code) {
    if (char === open) delta += 1;
    else if (char === close) delta -= 1;
  }
  return delta;
}

// Group already-cleaned lines into alternating prose/code chunks using the same
// continuation rules as the app renderer.
export function chunkLines(lines) {
  const chunks = [];
  let kind = null;
  let buffer = [];
  let braceDepth = 0;
  let parenDepth = 0;
  let inBlockComment = false;

  const flush = () => {
    while (buffer.length && !buffer[0].trim()) buffer.shift();
    while (buffer.length && !buffer.at(-1).trim()) buffer.pop();
    if (kind && buffer.length) chunks.push({ kind, lines: buffer });
    kind = null;
    buffer = [];
    braceDepth = 0;
    parenDepth = 0;
  };

  for (const line of lines) {
    const startsBlockComment = line.includes("/*") && !line.includes("*/");
    let nextKind = inBlockComment || looksLikeCodeLine(line) ? "code" : "text";
    if (kind === "code" && (braceDepth > 0 || parenDepth > 0) && line.trim()) {
      nextKind = "code";
    }
    if (!line.trim()) {
      if (kind === "code") buffer.push(line);
      else flush();
      continue;
    }
    if (kind && kind !== nextKind) flush();
    kind = nextKind;
    buffer.push(line);
    if (nextKind === "code" && !inBlockComment) {
      braceDepth += netDelta(line, "{", "}");
      parenDepth = Math.max(0, parenDepth + netDelta(line, "(", ")"));
    }
    if (inBlockComment && line.includes("*/")) inBlockComment = false;
    else if (startsBlockComment) inBlockComment = true;
  }
  flush();
  return chunks;
}

function deindent(lines) {
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => (line.trim() ? line.slice(cut) : ""));
}

// Join hard-wrapped prose lines into sentences; keep bullets and example calls
// on their own lines.
function reflowProseChunk(lines) {
  const out = [];
  let current = "";
  const push = () => {
    if (current.trim()) out.push(fixLostSuperscripts(current.trim().replace(/\s{2,}/g, " ")));
    current = "";
  };
  let lastStandalone = false;
  for (const raw of lines) {
    const line = normalizeInlineSpacing(stripEmbeddedBlanks(raw)).trim();
    if (!line) {
      push();
      lastStandalone = false;
      continue;
    }
    const isBullet = /^(-|•|\d+\.\s|[a-e]\.\s)/.test(line);
    const isExampleCall = /(\]|\))\.\w+\(.*\)\s*(->|-|=|returns|→)/.test(line) || (/returns\b/.test(line) && /[[\]()]/.test(line));
    const isHeaderish = /^[A-Za-z][^.!?]{0,60}:$/.test(line);
    if (isBullet || isExampleCall || isHeaderish) {
      push();
      out.push(fixLostSuperscripts(line.replace(/^•\s*/, "- ")));
      lastStandalone = true;
      continue;
    }
    // An example or bullet that ended mid-thought absorbs its continuation.
    if (lastStandalone && out.length && /[,;]$|\band\b$/.test(out.at(-1))) {
      out[out.length - 1] += ` ${fixLostSuperscripts(line)}`;
      continue;
    }
    lastStandalone = false;
    current = current ? `${current} ${line}` : line;
  }
  push();
  return out;
}

// Render cleaned chunks back into a content string for prompt/reference/parts.
export function renderChunks(chunks) {
  const blocks = [];
  for (const chunk of chunks) {
    if (chunk.kind === "code") {
      blocks.push(deindent(chunk.lines).join("\n").replace(/\n{3,}/g, "\n\n"));
    } else {
      blocks.push(reflowProseChunk(chunk.lines).join("\n"));
    }
  }
  return blocks.filter(Boolean).join("\n\n").trim();
}

export function cleanSectionLines(lines) {
  const kept = [];
  for (const line of lines) {
    if (isPageFurniture(line) || isAnswerScaffolding(line)) {
      if (kept.length && kept.at(-1).trim() !== "") kept.push("");
      continue;
    }
    kept.push(stripEmbeddedBlanks(line).replace(/[ \t]+$/g, ""));
  }
  while (kept.length && !kept[0].trim()) kept.shift();
  while (kept.length && !kept.at(-1).trim()) kept.pop();
  return kept;
}

// ---------------------------------------------------------------------------
// Exam-side question splitting
// ---------------------------------------------------------------------------

const COVER_HINTS = /(questions? on this (test|exam)|points available|scaled to|closed (book|note)|fill in|bubble|instructions)/i;

export function splitExamQuestions(text) {
  const lines = text.split("\n");
  const headings = [];
  lines.forEach((line, index) => {
    // A few exams label a multi-part programming problem as "2A." and
    // "2B." while still counting it as a single Question 2. Treat the first
    // lettered heading as question 2; the subsequent part stays in that
    // section until Question 3 begins.
    const match = line.match(/^\s{0,4}(\d{1,2})(?:[A-Z])?\.\s+(.*)$/);
    if (!match) return;
    if (!/point|pts/i.test(line)) return;
    if (COVER_HINTS.test(line)) return;
    headings.push({ index, number: Number(match[1]), text: match[2] });
  });

  const ordered = [];
  let expected = 1;
  for (const heading of headings) {
    if (heading.number === expected) {
      ordered.push(heading);
      expected += 1;
    }
  }

  // Cut trailing answer-sheet scaffolding off the final question: either an
  // explicit header or a run of bare letter markers with answer blanks.
  let sheetIndex = lines.findIndex((line) => /Question 1 answer Sheet|Answer Sheet\.?\s*(Name|$)/i.test(line.trim()));
  if (sheetIndex === -1 && ordered.length) {
    const lastStart = ordered.at(-1).index;
    for (let index = lastStart + 1; index < lines.length; index += 1) {
      if (!/^\s*[A-B]\.\s*(_{2,})?\s*$/.test(lines[index])) continue;
      const window = lines.slice(index, index + 16);
      const bareMarkers = window.filter((line) => /^\s*[A-Z]\.?\s*(\d\.)?\s*(_{2,})?\s*$/.test(line.trim()) && line.trim()).length;
      const blanks = window.filter((line) => /_{3,}/.test(line)).length;
      if (bareMarkers >= 3 || blanks >= 4) {
        sheetIndex = index;
        break;
      }
    }
  }

  return ordered.map((heading, index) => {
    let end = ordered[index + 1]?.index ?? lines.length;
    if (sheetIndex > heading.index && sheetIndex < end) end = sheetIndex;
    return {
      number: heading.number,
      heading: normalizeInlineSpacing(heading.text).trim(),
      lines: lines.slice(heading.index, end),
    };
  });
}

export function pointsFromHeading(heading) {
  const each = heading.match(/(\d+(?:\.\d+)?)\s*points?\s+each/i);
  const explicitTotal = heading.match(/(\d+(?:\.\d+)?)\s*(?:points?|pts?)\s+total/i);
  if (explicitTotal) {
    return { total: Number(explicitTotal[1]), each: each ? Number(each[1]) : null };
  }
  // Otherwise the only point figure that is not "each" is the total.
  const all = [...heading.matchAll(/(\d+(?:\.\d+)?)\s*(?:points?|pts?)/gi)].filter(
    (match) => !/each/i.test(heading.slice(match.index, match.index + match[0].length + 8)),
  );
  return {
    total: all.length ? Number(all.at(-1)[1]) : null,
    each: each ? Number(each[1]) : null,
  };
}

// ---------------------------------------------------------------------------
// Question 1: multi-part short answer
// ---------------------------------------------------------------------------

const PART_MARKER = /^\s{0,3}([A-Z])\s{0,2}[.)]\s+(\S.*)$/;
const CONTEXT_MARKER = /^\s{0,3}For\s+(questions?\s+)?([A-Z])\s*(?:-|through|to)\s*([A-Z])/i;

function nextLetter(letter) {
  return String.fromCharCode(letter.charCodeAt(0) + 1);
}

export function parseShortAnswerParts(sectionLines, warn) {
  // Skip the heading line itself.
  const lines = sectionLines.slice(1);
  const segments = [];
  let intro = [];
  let current = null;
  let expected = "A";

  for (const line of lines) {
    const context = line.match(CONTEXT_MARKER);
    const part = line.match(PART_MARKER);
    if (part && (part[1] === expected || part[1] === nextLetter(expected))) {
      if (part[1] === nextLetter(expected)) {
        warn(`short-answer part ${expected} not found; jumped to ${part[1]}`);
        expected = part[1];
      }
      current = { kind: "part", letter: part[1], lines: [part[2]] };
      segments.push(current);
      expected = nextLetter(expected);
      continue;
    }
    if (context && current) {
      current = { kind: "context", lines: [line.trim().replace(/^For\s+questions?\s+/i, "For ")] };
      segments.push(current);
      continue;
    }
    if (current) current.lines.push(line);
    else intro.push(line);
  }

  return {
    introLines: intro,
    parts: segments
      .filter((segment) => segment.kind === "part")
      .map((segment) => ({
        letter: segment.letter,
        text: renderChunks(chunkLines(cleanSectionLines(segment.lines))),
      })),
    contexts: segments
      .filter((segment) => segment.kind === "context")
      .map((segment) => renderChunks(chunkLines(cleanSectionLines(segment.lines)))),
    // Keep original interleaving for assembly.
    segments: segments.map((segment) => ({
      kind: segment.kind,
      letter: segment.letter,
      text: renderChunks(chunkLines(cleanSectionLines(segment.lines))),
    })),
  };
}

export const SHORT_ANSWER_PROMPT =
  "Answer each short-answer item. For compile errors answer compile error; for runtime errors answer runtime error; for infinite loops answer infinite loop. Big O answers should be the most restrictive correct Big O.";

// ---------------------------------------------------------------------------
// Solution-side parsing
// ---------------------------------------------------------------------------

// Split a solution document into numbered sections. Headings must sit at low
// indentation and either announce themselves (Comments / Suggested Solution /
// NUMBER n) or be followed shortly by solution-ish content; this avoids the
// classic failure of treating an indented answer such as "2. Valid" as the
// start of question 2's solution.
export function splitSolutionSections(text, questionCount, warn) {
  const lines = text.split("\n");
  const candidates = [];
  lines.forEach((line, index) => {
    let match = line.match(/^\s{0,2}(\d{1,2})\.\s*(.*)$/);
    if (match) {
      candidates.push({ index, number: Number(match[1]), rest: match[2] });
      return;
    }
    match = line.match(/^\s*NUMBER\s+(\d{1,2})[,:.\s-]*(.*)/i);
    if (match) candidates.push({ index, number: Number(match[1]), rest: match[2], strong: true });
  });

  const sections = new Map();
  let expected = 1;
  for (const candidate of candidates) {
    if (candidate.number !== expected) continue;
    const strong =
      candidate.strong ||
      /^(Comments|Suggested|Answers? as shown|As written|Answers|Solution|SHORT ANSWER)/i.test(candidate.rest) ||
      /\(?\d+\s*(points?|pts?)/i.test(candidate.rest);
    const lookahead = lines
      .slice(candidate.index + 1, candidate.index + 40)
      .join("\n");
    const supported =
      /Suggested|Comments|Criteria|Solution|Answer/i.test(lookahead) ||
      /^\s*[A-B]\.\s+\S/m.test(lookahead) ||
      candidate.rest.trim().length > 40; // long prose sentence, not a stray key answer
    if (!strong && !supported) continue;
    sections.set(candidate.number, { start: candidate.index });
    expected += 1;
    if (expected > questionCount) break;
  }

  const numbers = [...sections.keys()];
  numbers.forEach((number, index) => {
    const section = sections.get(number);
    section.end = sections.get(numbers[index + 1])?.start ?? lines.length;
    section.lines = lines.slice(section.start, section.end);
  });

  if (numbers.length !== questionCount) {
    warn(`solution sections found: ${numbers.join(", ") || "none"} (expected 1-${questionCount})`);
  }
  return sections;
}

// Parse the lettered answer key for question 1, handling the two-column layout
// used from ~2019 onward. Returns Map(letter -> [cell lines]).
export function parseAnswerKey(keyLines, warn) {
  // Establish the column boundary from lines holding two letter markers.
  let rightColumn = null;
  const markerAt = (line) => {
    const matches = [...line.matchAll(/(?:^|\s{2,})([A-Z])\.\s+\S/g)];
    return matches.map((match) => ({
      letter: match[1],
      index: match.index + match[0].indexOf(match[1]),
    }));
  };
  for (const line of keyLines) {
    const markers = markerAt(line);
    if (markers.length === 2 && markers[1].index > 20) {
      rightColumn = rightColumn === null ? markers[1].index : Math.min(rightColumn, markers[1].index);
    }
  }

  const cells = new Map();
  let leftCurrent = null;
  let rightCurrent = null;
  const assign = (letter, text) => {
    if (!cells.has(letter)) cells.set(letter, []);
    if (text.trim()) cells.get(letter).push(text.trim());
    return cells.get(letter);
  };

  for (const raw of keyLines) {
    const line = raw.replace(/[ \t]+$/g, "");
    if (!line.trim()) continue;
    if (isPageFurniture(line)) continue;
    let left = line;
    let right = null;
    if (rightColumn !== null && line.length > rightColumn - 4) {
      left = line.slice(0, Math.max(0, rightColumn - 2));
      right = line.slice(Math.max(0, rightColumn - 2));
      if (!right.trim()) right = null;
    }
    for (const [text, side] of [[left, "left"], [right, "right"]]) {
      if (text === null) continue;
      const match = text.match(/^\s*([A-Z])\.\s+(.*)$/);
      if (match) {
        const bucket = assign(match[1], match[2]);
        if (side === "left") leftCurrent = bucket;
        else rightCurrent = bucket;
      } else if (text.trim()) {
        const bucket = side === "left" ? leftCurrent : rightCurrent;
        if (bucket) bucket.push(text.trim());
      }
    }
  }

  if (!cells.size) warn("no lettered answers found in solution key");
  return cells;
}

// Separate a raw key cell into the expected answer plus grading notes.
//
// Notes are grading commentary that should not be part of the string students
// are matched against: a trailing parenthetical preceded by a space ("44
// seconds (if not simplified -2)") or a tolerance suffix (", +/- 1 on each
// coefficient"). "O(N2)" style answers keep their parentheses.
function splitAnswerAndNotes(value) {
  let result = value.trim();
  const notes = [];
  let match;
  while ((match = result.match(/\s\(([^()]*)\)$/))) {
    notes.unshift(match[1].trim());
    result = result.slice(0, match.index).trim();
  }
  const tolerance = result.match(/,\s*(\+\/-.*)$/);
  if (tolerance) {
    notes.push(tolerance[1].trim());
    result = result.slice(0, tolerance.index).trim();
  }
  result = result.replace(/^T\(N\)\s*=\s*/, "");
  return { result: fixLostSuperscripts(result), notes: notes.map((note) => fixLostSuperscripts(note)) };
}

export function keyCellToAnswer(letter, cellLines) {
  // Merge wrapped lines into logical answers; a line starting "1." / "2."
  // begins a numbered sub-answer.
  const logical = [];
  for (const raw of cellLines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d{1,2}\.\s+/.test(line) || !logical.length) logical.push(line);
    else logical[logical.length - 1] += ` ${line}`;
  }
  const isSubList = logical.length > 1 && logical.every((line) => /^\d{1,2}\.\s+/.test(line));

  if (isSubList) {
    const subAnswers = [];
    const notes = [];
    logical.forEach((line, index) => {
      const body = line.replace(/^\d{1,2}\.\s+/, "");
      const split = splitAnswerAndNotes(body);
      subAnswers.push(split.result);
      for (const note of split.notes) notes.push(`${letter}${index + 1}: ${note}`);
    });
    return { answer: subAnswers.join("; "), notes, isSubList, subAnswers };
  }

  const joined = logical.join(" ").replace(/\s{2,}/g, " ");
  const split = splitAnswerAndNotes(joined);
  return {
    answer: split.result,
    notes: split.notes.map((note) => `${letter}: ${note}`),
    isSubList: false,
    subAnswers: null,
  };
}

// ---------------------------------------------------------------------------
// Programming questions
// ---------------------------------------------------------------------------

export function extractSignatureBlocks(lines) {
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const signature =
      line.match(/^\s*(public|private|protected)\s+[\w<>[\], .]+\s+(\w+)\s*(\(|$)/) ??
      line.match(/^\s*(public|private)\s+([A-Z]\w*)\s*(\()/); // constructor
    if (!signature) continue;
    // Signature may span multiple lines until the opening brace (the opening
    // paren itself can start the next line).
    let end = index;
    let joined = line.trim();
    while (!/[{]\s*$/.test(joined) && !/\)\s*$/.test(joined) && end + 1 < lines.length && end - index < 4) {
      end += 1;
      joined += ` ${lines[end].trim()}`;
    }
    if (!joined.includes("(")) continue;
    // Collect the comment block directly above. Block comments here often have
    // bare continuation lines and blank lines inside ("/* pre: ...\n\n post:
    // ...\n...\n*/"), so first look for a /* opener within range; fall back to
    // strict marker-only collection for // style comments.
    let commentStart = index;
    let openerIndex = -1;
    for (let cursor = index - 1; cursor >= 0 && index - cursor <= 14; cursor -= 1) {
      const trimmed = lines[cursor].trim();
      if (trimmed.startsWith("/*")) {
        openerIndex = cursor;
        break;
      }
      const isCommentToken = /^(\*\/|\/\/|\*)/.test(trimmed);
      if (!isCommentToken && looksLikeCodeLine(lines[cursor])) break;
    }
    if (openerIndex !== -1) {
      commentStart = openerIndex;
    } else {
      let cursor = index - 1;
      while (cursor >= 0) {
        const trimmed = lines[cursor].trim();
        if (!trimmed) break;
        if (/^(\/\*|\*\/|\/\/|\*)/.test(trimmed) || /^(pre|post)\b/i.test(trimmed)) {
          commentStart = cursor;
          cursor -= 1;
          continue;
        }
        break;
      }
    }
    blocks.push({
      start: commentStart,
      end,
      name: signature[2],
      signature: joined.replace(/\s{2,}/g, " ").replace(/\s*\{\s*$/, "").trim(),
      commentLines: lines.slice(commentStart, index).map((value) => value.trim()),
    });
    index = end;
  }
  return blocks;
}

export function extractPrePost(commentLines) {
  const text = commentLines
    .join(" ")
    .replace(/\/\*|\*\/|\/\//g, " ")
    .replace(/^\s*\*+/gm, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  const pre = text.match(/pre:\s*(.*?)(?=post:|$)/i)?.[1]?.trim();
  const post = text.match(/post:\s*(.*)$/i)?.[1]?.trim();
  return { pre, post };
}

export function parseRubric(criteriaLines, warn) {
  const items = [];
  let current = null;
  for (const raw of criteriaLines) {
    let line = normalizeInlineSpacing(stripEmbeddedBlanks(raw)).trim().replace(/^[-•]\s*/, "");
    if (!line) continue;
    if (
      /^(General )?Grading [Cc]riteria/i.test(line) ||
      /^Criteria/i.test(line) ||
      /^\d+\s*points?\s*,?\s*Criteria:?/i.test(line)
    )
      continue;
    if (/^(IF\b|Other deductions|Usage errors|Common problems|NOTE:|Points? off|Also:)/i.test(line)) break;
    // Keep any trailing commentary in parentheses with the label, not the points.
    let note = "";
    const parenthetical = line.match(/^(.*?)\s*(\([^()]*\))\s*$/);
    if (parenthetical && /\d\s*(points?|pts?)/i.test(parenthetical[1])) {
      line = parenthetical[1].trim();
      note = ` ${parenthetical[2]}`;
    }
    const match =
      line.match(/^(.*?)\s*[:\-,]\s*(\d+(?:\.\d+)?)\s*(?:points?|pts?)?\.?$/) ??
      line.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*(?:points?|pts?)\.?$/) ??
      line.match(/^(\d+(?:\.\d+)?)\s*(?:points?|pts?)[:\-,.]?\s+(.*)$/);
    if (match) {
      const numericFirst = /^\d/.test(match[1]) && Number.isFinite(Number(match[1]));
      const label = (numericFirst ? match[2] : match[1]).trim().replace(/\s{2,}/g, " ").replace(/[,;:]+$/, "");
      const points = Number(numericFirst ? match[1] : match[2]);
      if (label && Number.isFinite(points) && points > 0 && points <= 30) {
        items.push({ label: `${label}${note}`, points });
        current = items.at(-1);
        continue;
      }
    }
    if (current && !/^\d/.test(line)) {
      current.label = `${current.label} ${line}`.replace(/\s{2,}/g, " ");
    }
  }
  if (!items.length) warn("no rubric items parsed from grading criteria");
  return items;
}
