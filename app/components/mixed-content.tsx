import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { ContentSegment } from "@/app/lib/exam-types";

export function CodeBlock({ code, className = "" }: { code?: string; className?: string }) {
  return (
    <SyntaxHighlighter
      language="java"
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

function isLikelyCodeLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  if (/^(-|•)\s+/.test(trimmed)) {
    return false;
  }
  if (
    /^(Restrictions|Facts and restrictions|Rules and restrictions|Allowed methods|Storage model|Examples|Example calls|Partial example|Facts|Method to implement):/.test(
      trimmed,
    )
  ) {
    return false;
  }
  if (/^(pre|post):\s/i.test(trimmed)) {
    return false;
  }
  if (/^(public|private|protected|static|final|abstract|class|interface|enum|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new)\b/.test(trimmed)) {
    return true;
  }
  if (/^[}\])]/.test(trimmed) || /;/.test(trimmed)) {
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

function inlineCodeParts(line: string) {
  const tokenPattern =
    /(\[[^\]\n]+\]|\{[^}\n]+\}|\b[A-Za-z_]\w*(?:<[^>\n]+>)?(?:\.[A-Za-z_]\w*)+\([^)\n]*\)|\b[A-Za-z_]\w*\([^)\n]*\)|\b[A-Za-z_]\w*(?:<[^>\n]+>)?(?:\[\])?(?:\.[A-Za-z_]\w*)+\b|\b(?:ArrayList|LinkedList|LinkedList314|Stack314|Queue314|BST314|RedBlackTree314|TreeMap|HashMap|TreeSet|GenericList|MathMatrix|MultiSet|LL314|IntBST|HashTable314|Scanner|IntStream)(?:<[^>\n]+>)?(?:\[\])?\b|\b(?:Map|Set|List|Iterator|Vertex|Edge|String|Integer|Object)(?:<[^>\n]+>|\[\])\b|\bO\([^)\n]+\)|\bN(?:\^?\d+)?\b|\b[a-zA-Z_]\w*\.length\b|\b[a-zA-Z_]\w*\[\]\b)/g;
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

function InlineFormattedLine({ line }: { line: string }) {
  const choiceLine = parseChoiceLine(line);
  if (choiceLine) {
    return (
      <span className="choice-line">
        {choiceLine.intro ? (
          <span className="choice-intro">
            <InlineFormattedLine line={choiceLine.intro} />
          </span>
        ) : null}
        <span className="choice-label-text">Choices</span>
        <span className="choice-options">
          {choiceLine.choices.map((choice) => (
            <span className="choice-option" key={choice.label}>
              <strong>{choice.label}</strong>
              <span>
                <InlineFormattedLine line={choice.text} />
              </span>
            </span>
          ))}
        </span>
      </span>
    );
  }

  return (
    <>
      {inlineCodeParts(line).map((part, index) =>
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

function splitMixedContent(content = "", forceCode = false): ContentSegment[] {
  if (forceCode) {
    return content.trim() ? [{ kind: "code", text: content.trim() }] : [];
  }

  const segments: ContentSegment[] = [];
  let currentKind: ContentSegment["kind"] | null = null;
  let currentLines: string[] = [];
  let inBlockComment = false;

  const flush = () => {
    const text = currentLines.join("\n").trim();
    if (currentKind && text) {
      segments.push({ kind: currentKind, text });
    }
    currentKind = null;
    currentLines = [];
  };

  for (const line of content.split("\n")) {
    const startsBlockComment = line.includes("/*") && !line.includes("*/");
    const nextKind: ContentSegment["kind"] = inBlockComment || isLikelyCodeLine(line) ? "code" : "text";
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
}: {
  content?: string;
  forceCode?: boolean;
  className?: string;
}) {
  const segments = splitMixedContent(content, forceCode);
  return (
    <div className={`mixed-content ${className}`}>
      {segments.map((segment, index) =>
        segment.kind === "code" ? (
          <CodeBlock code={segment.text} key={`${segment.kind}-${index}`} />
        ) : (
          <div className="mixed-prose" key={`${segment.kind}-${index}`}>
            {segment.text.split("\n").map((line, lineIndex) => (
              <p key={lineIndex}>
                <InlineFormattedLine line={line} />
              </p>
            ))}
          </div>
        ),
      )}
    </div>
  );
}

export function InlineProseContent({ content, className = "" }: { content?: string; className?: string }) {
  return (
    <div className={`mixed-prose ${className}`}>
      {(content ?? "").split("\n").map((line, index) => (
        <p key={index}>
          <InlineFormattedLine line={line} />
        </p>
      ))}
    </div>
  );
}

