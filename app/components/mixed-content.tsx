import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { ReactNode } from "react";
import type { CodeLanguage, ContentSegment } from "@/app/lib/exam-types";

export function CodeBlock({
  code,
  className = "",
  language = "java",
}: {
  code?: string;
  className?: string;
  language?: CodeLanguage;
}) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneLight}
      className={`code-display ${className}`}
      customStyle={{
        margin: 0,
        padding: "18px",
        background: "#f2f4f7",
        border: "1px solid #d7dce3",
        borderRadius: "6px",
        fontSize: "13px",
        lineHeight: "1.55",
        overflow: "visible",
      }}
      codeTagProps={{
        style: {
          fontFamily:
            "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        },
      }}
      wrapLongLines
    >
      {code ?? ""}
    </SyntaxHighlighter>
  );
}

// Lines that should always be treated as prose, even when they appear inside an
// open code block (used to break out of a class/method body).
function isProseMarker(line: string) {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  if (/^(\/\*|\*\/|\/\/|\*)/.test(trimmed)) {
    return false;
  }
  if (/^(-|•)\s+/.test(trimmed)) {
    return true;
  }
  if (
    /^(Restrictions|Facts and restrictions|Rules and restrictions|Allowed methods|Storage model|Examples|Example calls|Partial example|Facts|Method to implement):/.test(
      trimmed,
    )
  ) {
    return true;
  }
  if (/^(pre|post):\s/i.test(trimmed)) {
    return true;
  }
  // Archived snippets frequently omit the closing brace of the surrounding
  // class. In that case brace depth alone cannot tell us when the PDF has
  // switched back to instructions. Treat an ordinary sentence as prose even
  // while an earlier class declaration is still technically "open".
  const withoutComment = trimmed.replace(/\/\/.*$/, "").trimEnd();
  if (
    !/[;{}]$/.test(withoutComment) &&
    !/^(public|private|protected|static|final|abstract|class|interface|enum|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|void|int|long|double|float|boolean|char|struct|typedef|unsigned|#include|#define)\b/.test(
      trimmed,
    ) &&
    !/[=+*/%]|\+\+|--/.test(withoutComment) &&
    (/^(A|An|And|As|Complete|Do|Each|For|If|In|Instead|None|Recall|Return|Returns|The|This|Use|When|Write|Writes|You)\b/i.test(
      trimmed,
    ) || trimmed.split(/\s+/).filter(Boolean).length >= 8)
  ) {
    return true;
  }
  return false;
}

// Net change in brace/paren depth for a code line, ignoring trailing line
// comments. Unbalanced parens keep multi-line signatures inside a code block.
function netDelta(line: string, open: string, close: string) {
  const code = line.replace(/\/\/.*$/, "");
  let delta = 0;
  for (const char of code) {
    if (char === open) {
      delta += 1;
    } else if (char === close) {
      delta -= 1;
    }
  }
  return delta;
}

function isLikelyCodeLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  if (isProseMarker(line)) {
    return false;
  }
  if (/^(public|private|protected|static|final|abstract|class|interface|enum|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|void|int|long|double|float|boolean|char|struct|typedef|unsigned|#include|#define)\b/.test(trimmed)) {
    return true;
  }
  // A sentence can contain a semicolon mid-line; only an ending semicolon or
  // brace (ignoring a trailing line comment) marks a statement.
  const withoutComment = trimmed.replace(/\/\/.*$/, "").trimEnd();
  if (/^[}\])]/.test(trimmed) || /[;{}]$/.test(withoutComment)) {
    return true;
  }
  if (/^(\/\*|\*\/|\/\/|\*)/.test(trimmed)) {
    return true;
  }
  return false;
}

function splitChoiceOptions(text: string) {
  const matches = [...text.matchAll(/(?:^|,\s+)([A-Z])(?:\.|\s)(?=\S)/g)];
  if (matches.length < 2) {
    return null;
  }

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;
    return {
      label: match[1],
      text: text.slice(start, end).replace(/^,\s*/, "").trim(),
    };
  });
}

function parseChoiceLine(line: string) {
  const marker = "Choices:";
  const markerIndex = line.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const intro = line.slice(0, markerIndex).trim();
  const choicesText = line.slice(markerIndex + marker.length).trim();
  const choices = splitChoiceOptions(choicesText);
  if (!choices) {
    return null;
  }
  return { intro, choices };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function codeVocabulary(segments: ContentSegment[]) {
  const terms = new Set<string>();
  for (const segment of segments) {
    if (segment.kind !== "code") {
      continue;
    }
    const source = segment.text
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/.*$/gm, " ")
      .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, " ");

    for (const match of source.matchAll(/\b(?:class|interface|enum)\s+([A-Za-z_]\w*)/g)) {
      terms.add(match[1]);
    }
    for (const match of source.matchAll(
      /\b(?:[A-Z][A-Za-z0-9_]*(?:\s*<[^;=(){}]+>)?(?:\[\])?|byte|short|int|long|float|double|boolean|char|var)\s+(?:\[\]\s*)?([A-Za-z_]\w*)\b/g,
    )) {
      terms.add(match[1]);
    }
    for (const match of source.matchAll(/\.\s*([A-Za-z_]\w*)\b|\b([A-Za-z_]\w*)\s*\(/g)) {
      terms.add(match[1] ?? match[2]);
    }
    for (const match of source.matchAll(/\b(?:[A-Z][A-Za-z0-9_]*|[A-Z][A-Z0-9_]{1,})\b/g)) {
      terms.add(match[0]);
    }
  }
  return terms;
}

function inlineCodeParts(line: string, vocabulary: ReadonlySet<string> = new Set()) {
  const contextualTerms = [...vocabulary]
    .filter((term) => term.length > 1)
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join("|");
  const contextual = contextualTerms ? `|\\b(?:${contextualTerms})\\b` : "";
  const tokenPattern = new RegExp(
    `(\\[[^\\]\\n]+\\]|\\{[^}\\n]+\\}|\\b[A-Za-z_]\\w*(?:<[^>\\n]+>)?(?:\\.[A-Za-z_]\\w*)+\\([^\\)\\n]*\\)|\\b[A-Za-z_]\\w*\\([^\\)\\n]*\\)|\\b[A-Za-z_]\\w*(?:<[^>\\n]+>)?(?:\\[\\])?(?:\\.[A-Za-z_]\\w*)+\\b|\\b(?:ArrayList|LinkedList|LinkedList314|Stack314|Queue314|BST314|RedBlackTree314|TreeMap|HashMap|TreeSet|GenericList|MathMatrix|MultiSet|LL314|IntBST|HashTable314|Scanner|IntStream)(?:<[^>\\n]+>)?(?:\\[\\])?\\b|\\b(?:Map|Set|List|Iterator|Vertex|Edge|String|Integer|Object)(?:<[^>\\n]+>|\\[\\])\\b|\\b(?:null|true|false)\\b|\\bO\\([^\\)\\n]+\\)|\\bN(?:\\^?\\d+)?\\b|\\b[a-zA-Z_]\\w*\\.length\\b|\\b[a-zA-Z_]\\w*\\[\\]\\b${contextual})`,
    "g",
  );
  const parts: Array<{ code: boolean; text: string }> = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenPattern)) {
    const text = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ code: false, text: line.slice(lastIndex, index) });
    }
    parts.push({ code: true, text });
    lastIndex = index + text.length;
  }

  if (lastIndex < line.length) {
    parts.push({ code: false, text: line.slice(lastIndex) });
  }

  return parts.length ? parts : [{ code: false, text: line }];
}

function InlineFormattedLine({ line, vocabulary }: { line: string; vocabulary?: ReadonlySet<string> }) {
  const choiceLine = parseChoiceLine(line);
  if (choiceLine) {
    return (
      <span className="choice-line">
        {choiceLine.intro ? (
          <span className="choice-intro">
            <InlineFormattedLine line={choiceLine.intro} vocabulary={vocabulary} />
          </span>
        ) : null}
        <span className="choice-label-text">Choices</span>
        <span className="choice-options">
          {choiceLine.choices.map((choice) => (
            <span className="choice-option" key={choice.label}>
              <strong>{choice.label}</strong>
              <span>
                <InlineFormattedLine line={choice.text} vocabulary={vocabulary} />
              </span>
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <>
      {inlineCodeParts(line, vocabulary).map((part, index) =>
        part.code ? (
          <code className="inline-code" key={index}>
            {part.text}
          </code>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

export function splitMixedContent(content = "", forceCode = false): ContentSegment[] {
  if (forceCode) {
    return content.trim() ? [{ kind: "code", text: content.trim() }] : [];
  }

  const segments: ContentSegment[] = [];
  let currentKind: ContentSegment["kind"] | null = null;
  let currentLines: string[] = [];
  let inBlockComment = false;
  let inFence = false;
  let braceDepth = 0;
  let parenDepth = 0;

  const flush = () => {
    const text = currentLines.join("\n").trimEnd();
    if (currentKind && text.trim()) {
      segments.push({ kind: currentKind, text: currentKind === "code" ? text.replace(/^\n+/, "") : text.trim() });
    }
    currentKind = null;
    currentLines = [];
    braceDepth = 0;
    parenDepth = 0;
  };

  for (const line of content.split("\n")) {
    // Explicit ``` fences force a code block (used for ASCII diagrams and
    // tables whose lines do not look like code on their own).
    if (line.trim().startsWith("```")) {
      flush();
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      if (currentKind !== "code") {
        flush();
        currentKind = "code";
      }
      currentLines.push(line);
      continue;
    }
    const startsBlockComment = line.includes("/*") && !line.includes("*/");
    let nextKind: ContentSegment["kind"] = inBlockComment || isLikelyCodeLine(line) ? "code" : "text";
    // Keep contiguous code blocks intact: a line inside an open brace block
    // (e.g. enum constants like "NORTH, SOUTH, EAST") or an unclosed argument
    // list (a multi-line method signature) stays code even when it does not
    // look like code on its own. Explicit prose markers still break out.
    if (currentKind === "code" && (braceDepth > 0 || parenDepth > 0) && line.trim() && !isProseMarker(line)) {
      nextKind = "code";
    }
    if (!line.trim()) {
      if (currentKind === "code") {
        currentLines.push(line);
      } else {
        flush();
      }
      continue;
    }
    if (currentKind && currentKind !== nextKind) {
      flush();
    }
    currentKind = nextKind;
    currentLines.push(line);
    if (nextKind === "code" && !inBlockComment) {
      braceDepth += netDelta(line, "{", "}");
      parenDepth = Math.max(0, parenDepth + netDelta(line, "(", ")"));
    }
    if (inBlockComment && line.includes("*/")) {
      inBlockComment = false;
    } else if (startsBlockComment) {
      inBlockComment = true;
    }
  }

  flush();
  return segments;
}

export function MixedContent({
  content,
  forceCode = false,
  className = "",
  language = "java",
}: {
  content?: string;
  forceCode?: boolean;
  className?: string;
  language?: CodeLanguage;
}) {
  const segments = splitMixedContent(content, forceCode);
  const vocabulary = codeVocabulary(segments);
  return (
    <div className={`mixed-content ${className}`}>
      {segments.map((segment, index) =>
        segment.kind === "code" ? (
          <CodeBlock code={segment.text} language={language} key={`${segment.kind}-${index}`} />
        ) : (
          <div className="mixed-prose" key={`${segment.kind}-${index}`}>
            {segment.text.split("\n").map((line, lineIndex) => (
              <p key={lineIndex}>
                <InlineFormattedLine line={line} vocabulary={vocabulary} />
              </p>
            ))}
          </div>
        ),
      )}
    </div>
  );
}

export function InlineProseContent({
  content,
  codeContext,
  className = "",
}: {
  content?: string;
  codeContext?: string;
  className?: string;
}) {
  const vocabulary = codeVocabulary(splitMixedContent(codeContext));
  return (
    <div className={`mixed-prose ${className}`}>
      {(content ?? "").split("\n").map((line, index) => (
        <p key={index}>
          <InlineFormattedLine line={line} vocabulary={vocabulary} />
        </p>
      ))}
    </div>
  );
}

const subscriptMap: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
  "₊": "+",
  "₋": "−",
};

const superscriptMap: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "−",
};

function scientificNodes(text: string) {
  const nodes: ReactNode[] = [];
  let plain = "";
  const flush = () => {
    if (plain) nodes.push(plain);
    plain = "";
  };

  for (let index = 0; index < text.length; ) {
    const character = text[index];
    const map = subscriptMap[character] ? subscriptMap : superscriptMap[character] ? superscriptMap : null;
    if (map) {
      flush();
      let value = "";
      while (index < text.length && map[text[index]]) {
        value += map[text[index]];
        index += 1;
      }
      const Tag = map === subscriptMap ? "sub" : "sup";
      nodes.push(<Tag key={`script-${index}`}>{value}</Tag>);
      continue;
    }
    if (character === "^" && /^[+\-−]?\d+/.test(text.slice(index + 1))) {
      flush();
      const exponent = text.slice(index + 1).match(/^[+\-−]?\d+/)?.[0] ?? "";
      nodes.push(<sup key={`exponent-${index}`}>{exponent.replace("-", "−")}</sup>);
      index += exponent.length + 1;
      continue;
    }
    plain += character;
    index += 1;
  }
  flush();
  return nodes;
}

export function ScientificText({ text }: { text: string }) {
  return <span className="scientific-notation">{scientificNodes(text)}</span>;
}

export function ScientificContent({ content, className = "" }: { content?: string; className?: string }) {
  return (
    <div className={`scientific-content ${className}`}>
      {(content ?? "").split("\n").map((line, index) => (
        <p key={index}>
          <ScientificText text={line} />
        </p>
      ))}
    </div>
  );
}
