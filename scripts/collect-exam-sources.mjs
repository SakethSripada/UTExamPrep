#!/usr/bin/env node
import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const examRoot = path.join(repoRoot, "exampdfs");
const tempRoot = path.join(examRoot, "_tmp-downloads");
const python = process.env.PDF_QC_PYTHON || "/tmp/utexamprep-pdf-venv/bin/python";

const officialHosts = new Set([
  "www.cs.utexas.edu",
  "cs.utexas.edu",
  "users.ece.utexas.edu",
  "testingservices.utexas.edu",
  "mccord.cm.utexas.edu",
  "laude.cm.utexas.edu",
  "www.sbs.utexas.edu",
]);

function canonicalUrl(value) {
  const url = new URL(value);
  url.hash = "";
  if (url.hostname === "users.ece.utexas.edu") {
    url.protocol = "https:";
  }
  return url.toString();
}

const seeds = [
  {
    course: "CS314",
    subject: "Computer Science",
    sourceName: "Scott CS314 Test Study Material",
    start: "https://www.cs.utexas.edu/~scottm/cs314/handouts/TestStudyMaterial.htm",
    depth: 0,
    note: "",
    accept: ({ url, text }) =>
      url.includes("/cs314/") &&
      !/cs307/i.test(url + " " + text) &&
      /\.(pdf)$/i.test(url) &&
      /(exam|test|final|grading|solution|criteria|fall|spring|oldexams|m\d|e\d)/i.test(url + " " + text),
  },
  {
    course: "CS303E",
    subject: "Computer Science",
    sourceName: "Young CS303E public syllabus",
    start: "https://www.cs.utexas.edu/~byoung/cs303e/syllabus303e.html",
    depth: 0,
    policyFlag: "Course page contains restrictions on sharing class recordings/slides and reminders not to post solutions publicly; user requested public materials be digitized and flagged.",
    accept: ({ url, text }) =>
      url.includes("/~byoung/cs303e/") &&
      /(exam|mock|sample|answer|solution|program)/i.test(url + " " + text) &&
      !/(slides|schedule|worksheet|hw|project|quiz|flyer)/i.test(url + " " + text),
    manual: [
      "https://www.cs.utexas.edu/~byoung/cs303e/MockExam1Spring2025.pdf",
      "https://www.cs.utexas.edu/~byoung/cs303e/MockExam2Spring2025.pdf",
      "https://www.cs.utexas.edu/~byoung/cs303e/MockExam2Fall2025.pdf",
      "https://www.cs.utexas.edu/~byoung/cs303e/MockExam3Fall2025.pdf",
    ],
  },
  {
    course: "CS439",
    subject: "Computer Science",
    sourceName: "Dahlin CS439 exams",
    start: "https://www.cs.utexas.edu/~dahlin/Classes/439/exams.html",
    depth: 0,
    accept: ({ url, text }) =>
      url.includes("/~dahlin/Classes/439/") && /\.(pdf)$/i.test(url) && /(exam|midterm|final|soln|solution)/i.test(url + " " + text),
  },
  {
    course: "EE306",
    subject: "Electrical and Computer Engineering",
    sourceName: "Patt EE306 exams",
    start: "https://users.ece.utexas.edu/~patt/25f.306/exams.html",
    depth: 0,
    accept: ({ url, text }) =>
      url.includes("/~patt/25f.306/") && /\.(pdf|txt)$/i.test(url) && /(exam|final|solution|soln|buzzword)/i.test(url + " " + text),
  },
  {
    course: "ECE313",
    subject: "Electrical and Computer Engineering",
    sourceName: "Evans ECE313 signal exams",
    start: "https://users.ece.utexas.edu/~bevans/courses/signals/lectures/midterm1/index.html",
    extraStarts: [
      "https://users.ece.utexas.edu/~bevans/courses/signals/lectures/midterm2/index.html",
      "https://users.ece.utexas.edu/~bevans/courses/signals/lectures/final/index.html",
    ],
    depth: 0,
    accept: ({ url, text }) =>
      url.includes("/~bevans/courses/signals/lectures/") &&
      /\.(pdf)$/i.test(url) &&
      /(midterm|final|blank|solution|appendix)/i.test(url + " " + text),
  },
  {
    course: "ECE445M",
    subject: "Electrical and Computer Engineering",
    sourceName: "Valvano/Gerstlauer ECE445M resources",
    start: "https://users.ece.utexas.edu/~valvano/EE445M/resources.html",
    extraStarts: ["https://users.ece.utexas.edu/~valvano/EE345Moldquiz/"],
    depth: 1,
    archiveNotice: "Archived official material may use prior course number EE345M.",
    accept: ({ url, text }) =>
      (/users\.ece\.utexas\.edu\/~gerstl\/.*(?:ee|ece)445m_[^/]+\/resources\//i.test(url) ||
        /users\.ece\.utexas\.edu\/~valvano\/EE345Moldquiz\//i.test(url)) &&
      /\.(pdf)$/i.test(url) &&
      /(midterm|final|quiz|exam|solution|sol\b|s\d\d|f\d\d|sp\d\d)/i.test(url + " " + text),
  },
  {
    course: "EE445L",
    subject: "Electrical and Computer Engineering",
    sourceName: "Valvano EE445L/EE345L old exams",
    start: "https://users.ece.utexas.edu/~valvano/EE345LFinal/",
    depth: 0,
    archiveNotice: "Archived official material uses prior course number EE345L.",
    accept: ({ url, text }) =>
      url.includes("/~valvano/EE345LFinal/") && /\.(pdf)$/i.test(url) && /(quiz|fin|sol|exam)/i.test(url + " " + text),
  },
  {
    course: "CH301-CH302",
    subject: "Chemistry",
    sourceName: "UT Testing and McCord chemistry practice",
    start: "https://testingservices.utexas.edu/ut-austin-exams-chemistry-ch-301-ch-302104m-104n",
    extraStarts: ["https://mccord.cm.utexas.edu/courses/fall2015/ch301/cpack/"],
    depth: 0,
    accept: ({ url, text }) =>
      (url.includes("testingservices.utexas.edu/sites/default/files/CH30") ||
        url.includes("mccord.cm.utexas.edu/courses/fall2015/ch301/cpack/")) &&
      /\.(pdf)$/i.test(url) &&
      /(practice|questions|exam|laude)/i.test(url + " " + text),
  },
  {
    course: "BIO311C-BIO311D",
    subject: "Biology",
    sourceName: "UT Testing and Brand BIO311C keyed exams",
    start: "https://testingservices.utexas.edu/ut-austin-exams-biology-bio-311c-311d",
    extraStarts: ["https://www.sbs.utexas.edu/brand/bio311c/pre-2010%20exams/"],
    depth: 0,
    accept: ({ url, text }) =>
      (url.includes("testingservices.utexas.edu/ut-austin-exams-biology") ||
        url.includes("www.sbs.utexas.edu/brand/bio311c/pre-2010%20exams/")) &&
      (/\.(pdf)$/i.test(url) || url.includes("testingservices.utexas.edu/ut-austin-exams-biology")) &&
      /(bio|exam|key|311c|311d)/i.test(url + " " + text),
  },
];

function stripHtml(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extensionForUrl(url, contentType = "") {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext && ext.length <= 8) {
    return ext;
  }
  if (/pdf/i.test(contentType)) return ".pdf";
  if (/html/i.test(contentType)) return ".html";
  if (/plain|text/i.test(contentType)) return ".txt";
  return ".html";
}

function normalizeTerm(source) {
  const value = decodeURIComponent(source).replace(/[_-]+/g, " ");
  const year = value.match(/\b(20\d{2}|19\d{2})\b/)?.[1] ?? value.match(/\b([fs](\d{2}))\b/i)?.[2];
  const fullYear = year?.length === 2 ? String(Number(year) >= 80 ? 1900 + Number(year) : 2000 + Number(year)) : year;
  const season =
    value.match(/\b(fall|fa|f)(?:\s|')?\d{2,4}\b/i)?.[1] ??
    value.match(/\b(spring|sp|s)(?:\s|')?\d{2,4}\b/i)?.[1] ??
    value.match(/\b(summer|su)(?:\s|')?\d{2,4}\b/i)?.[1] ??
    value.match(/\b\d{2,4}\s+(fall|spring|summer)\b/i)?.[1];
  if (fullYear && season) {
    const normalizedSeason = /^f/i.test(season) && !/^sp/i.test(season) ? "fall" : /^su/i.test(season) ? "summer" : "spring";
    return `${fullYear}-${normalizedSeason}`;
  }
  if (fullYear) return fullYear;
  return "undated";
}

function inferExamType(source) {
  const value = decodeURIComponent(source).toLowerCase();
  if (/final|fin/.test(value)) return "final";
  if (/midterm\s*1|midterm1|exam\s*1|exam1|quiz\s*1|quiz1|_e1|m1/.test(value)) return "exam-1";
  if (/midterm\s*2|midterm2|exam\s*2|exam2|quiz\s*2|quiz2|_e2|m2/.test(value)) return "exam-2";
  if (/midterm\s*3|midterm3|exam\s*3|exam3|quiz\s*3|quiz3|_e3|m3/.test(value)) return "exam-3";
  if (/mock/.test(value)) return "mock-exam";
  if (/practice|sample/.test(value)) return "practice";
  return "exam";
}

function inferRole(source, contentType = "") {
  const value = decodeURIComponent(source).toLowerCase();
  if (/\.(py|java|c|cpp)$/i.test(new URL(source, "https://example.com").pathname)) return "solution-code";
  if (/blank|without solutions/.test(value)) return "exam";
  if (/answer|solution|soln|sol\.|sol_|key|criteria|gradingcrit|with solutions|appendix/.test(value)) return "solution";
  if (/practice-questions|questions/.test(value)) return "exam-with-answers";
  if (/html|text|plain/.test(contentType)) return "support";
  return "exam";
}

function safeName(value) {
  return decodeURIComponent(value)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase()
    .slice(0, 120);
}

function localPathFor(item, headers) {
  const ext = extensionForUrl(item.url, headers.contentType);
  const label = safeName(`${inferExamType(item.url + " " + item.text)}-${inferRole(item.url + " " + item.text, headers.contentType)}-${item.text || path.basename(new URL(item.url).pathname)}`);
  const term = normalizeTerm(item.url + " " + item.text);
  const subdir = ext === ".pdf" ? "" : "non-pdf";
  return path.join(examRoot, item.course.toLowerCase(), term, subdir, `${label || "source"}${ext}`);
}

async function curl(args, options = {}) {
  const { stdout, stderr } = await execFile("curl", args, {
    maxBuffer: options.maxBuffer ?? 30 * 1024 * 1024,
    env: { ...process.env, LC_ALL: "C" },
  });
  if (options.stderr) {
    return { stdout, stderr };
  }
  return stdout;
}

async function fetchText(url) {
  try {
    return await curl(["-k", "-L", "--fail", "--silent", "--show-error", url], { maxBuffer: 20 * 1024 * 1024 });
  } catch {
    return "";
  }
}

function extractLinks(html, baseUrl) {
  const links = [];
  const pattern = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) continue;
    try {
      const url = canonicalUrl(new URL(href, baseUrl).toString());
      const host = new URL(url).host;
      if (!officialHosts.has(host)) continue;
      links.push({ url, text: stripHtml(match[2]) });
    } catch {
      // Ignore malformed links.
    }
  }
  return links;
}

async function collectCandidates() {
  const candidates = new Map();
  const sourcePages = [];

  for (const seed of seeds) {
    const starts = [seed.start, ...(seed.extraStarts ?? [])].map(canonicalUrl);
    const queue = starts.map((url) => ({ url, depth: 0 }));
    const seenPages = new Set();

    for (const manualUrl of seed.manual ?? []) {
      const url = canonicalUrl(manualUrl);
      candidates.set(`${seed.course}:${url}`, {
        ...seed,
        url,
        text: path.basename(new URL(url).pathname),
        discoveredFrom: canonicalUrl(seed.start),
      });
    }

    while (queue.length > 0) {
      const page = queue.shift();
      if (!page || seenPages.has(page.url)) continue;
      seenPages.add(page.url);
      const html = await fetchText(page.url);
      if (!html) continue;
      sourcePages.push({
        course: seed.course,
        sourceName: seed.sourceName,
        url: page.url,
        policyFlag: seed.policyFlag ?? "",
        archiveNotice: seed.archiveNotice ?? "",
      });
      const links = extractLinks(html, page.url);
      for (const link of links) {
        const payload = { ...seed, ...link, discoveredFrom: page.url };
        if (seed.accept(payload)) {
          candidates.set(`${seed.course}:${link.url}`, payload);
        }
        if (page.depth < seed.depth && !/\.(pdf|docx?|pptx?|xlsx?|zip|jpg|png|gif|py|txt)$/i.test(new URL(link.url).pathname)) {
          queue.push({ url: link.url, depth: page.depth + 1 });
        }
      }
    }
  }

  return { candidates: [...candidates.values()].sort((a, b) => a.course.localeCompare(b.course) || a.url.localeCompare(b.url)), sourcePages };
}

async function head(url) {
  try {
    const output = await curl(["-k", "-L", "-I", "--silent", "--show-error", url], { maxBuffer: 1024 * 1024 });
    const statusMatches = [...output.matchAll(/^HTTP\/\S+\s+(\d+)/gim)];
    const status = statusMatches.length ? Number(statusMatches.at(-1)[1]) : 0;
    const contentTypeMatches = [...output.matchAll(/^content-type:\s*(.+)$/gim)];
    const contentLengthMatches = [...output.matchAll(/^content-length:\s*(\d+)/gim)];
    const contentType = contentTypeMatches.length ? contentTypeMatches.at(-1)[1].trim() : "";
    const contentLength = contentLengthMatches.length ? Number(contentLengthMatches.at(-1)[1]) : 0;
    return { status, contentType, contentLength };
  } catch {
    return { status: 0, contentType: "", contentLength: 0 };
  }
}

async function pdfInfo(filePath) {
  try {
    const { stdout } = await execFile("pdfinfo", [filePath], { maxBuffer: 1024 * 1024 });
    const pages = Number(stdout.match(/^Pages:\s+(\d+)/im)?.[1] ?? 0);
    const encrypted = /Encrypted:\s+yes/i.test(stdout);
    return { pages, encrypted, error: "" };
  } catch (error) {
    return { pages: 0, encrypted: false, error: String(error.stderr || error.message || error) };
  }
}

async function textStats(filePath, ext) {
  if (ext !== ".pdf") {
    const text = await readFile(filePath, "utf8").catch(() => "");
    return { textChars: text.replace(/\s+/g, "").length, hasAnswerSignals: /(answer|solution|key|correct|rubric)/i.test(text) };
  }
  const script = `
import json, sys
from pypdf import PdfReader
path = sys.argv[1]
reader = PdfReader(path)
chars = 0
sample = []
for page in reader.pages[:min(5, len(reader.pages))]:
    text = page.extract_text() or ""
    chars += len("".join(text.split()))
    sample.append(text[:2000])
joined = "\\n".join(sample)
print(json.dumps({"textChars": chars, "hasAnswerSignals": bool(__import__("re").search(r"answer|solution|key|correct|rubric|grading", joined, __import__("re").I))}))
`;
  try {
    const { stdout } = await execFile(python, ["-c", script, filePath], { maxBuffer: 4 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch {
    return { textChars: 0, hasAnswerSignals: false };
  }
}

function qcStatus({ headers, ext, info, stats, role }) {
  const reasons = [];
  if (headers.status && headers.status >= 400) reasons.push(`HTTP ${headers.status}`);
  if (ext === ".pdf") {
    if (!/pdf/i.test(headers.contentType) && headers.contentType) reasons.push(`content-type ${headers.contentType}`);
    if (info.error) reasons.push("pdfinfo failed");
    if (info.encrypted) reasons.push("encrypted");
    if (!info.pages) reasons.push("no pages");
    if (stats.textChars < 80) reasons.push("low text extraction; needs visual/OCR review");
  }
  if (role === "solution" && !stats.hasAnswerSignals) {
    reasons.push("solution role lacks answer-key text signal");
  }
  if (reasons.length) {
    const fatal = reasons.some((reason) => /HTTP|pdfinfo|encrypted|no pages|content-type/.test(reason));
    return { status: fatal ? "rejected" : "needs-review", reasons };
  }
  return { status: "passed-source-qc", reasons };
}

async function download(item) {
  const headers = await head(item.url);
  const ext = extensionForUrl(item.url, headers.contentType);
  const localPath = localPathFor(item, headers);
  await mkdir(path.dirname(localPath), { recursive: true });
  await mkdir(tempRoot, { recursive: true });
  const tmpPath = path.join(tempRoot, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  let downloadError = "";
  try {
    await curl(["-k", "-L", "--fail", "--silent", "--show-error", "-o", tmpPath, item.url], { maxBuffer: 1024 * 1024 });
    await rename(tmpPath, localPath);
  } catch (error) {
    downloadError = String(error.stderr || error.message || error);
    await rm(tmpPath, { force: true });
  }
  const role = inferRole(item.url + " " + item.text, headers.contentType);
  const examType = inferExamType(item.url + " " + item.text);
  let hash = "";
  let bytes = 0;
  let info = { pages: 0, encrypted: false, error: downloadError };
  let stats = { textChars: 0, hasAnswerSignals: false };
  if (!downloadError) {
    const data = await readFile(localPath);
    bytes = data.length;
    hash = createHash("sha256").update(data).digest("hex");
    info = ext === ".pdf" ? await pdfInfo(localPath) : { pages: 0, encrypted: false, error: "" };
    stats = await textStats(localPath, ext);
  }
  const qc = downloadError
    ? { status: "rejected", reasons: [downloadError.slice(0, 300)] }
    : qcStatus({ headers, ext, info, stats, role });
  return {
    course: item.course,
    subject: item.subject,
    term: normalizeTerm(item.url + " " + item.text),
    examType,
    role,
    title: item.text || path.basename(new URL(item.url).pathname),
    sourceName: item.sourceName,
    sourceUrl: item.url,
    discoveredFrom: item.discoveredFrom,
    localPath: path.relative(repoRoot, localPath),
    sha256: hash,
    bytes,
    pageCount: info.pages,
    contentType: headers.contentType,
    policyFlags: item.policyFlag ? [item.policyFlag] : [],
    archiveNotice: item.archiveNotice ?? "",
    qcStatus: qc.status,
    qcNotes: qc.reasons,
    hasOfficialSolutions: role === "solution" || role === "exam-with-answers" || stats.hasAnswerSignals,
    digitizationStatus: "source-only",
  };
}

function pairKey(record) {
  return `${record.course}|${record.term}|${record.examType}`;
}

function applyPairMetadata(records) {
  const groups = new Map();
  for (const record of records) {
    const key = pairKey(record);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    const hasSolution = group.some((record) => record.role === "solution" || record.role === "exam-with-answers");
    const hasExam = group.some((record) => record.role !== "solution");
    for (const record of group) {
      record.hasExamSolutionPair = hasExam && hasSolution;
      if (record.qcStatus === "passed-source-qc" && !record.hasExamSolutionPair && record.role === "exam") {
        record.qcStatus = "needs-review";
        record.qcNotes = [...record.qcNotes, "no matched official solution/key found in inventory"];
      }
      if (record.qcStatus === "passed-source-qc" && !record.hasExamSolutionPair && record.role === "solution") {
        record.qcStatus = "needs-review";
        record.qcNotes = [...record.qcNotes, "no matched exam prompt found in inventory"];
      }
    }
  }
}

async function main() {
  const { candidates, sourcePages } = await collectCandidates();
  console.log(`Collected ${candidates.length} candidate source files from ${sourcePages.length} source pages.`);
  const records = [];
  for (let index = 0; index < candidates.length; index++) {
    const item = candidates[index];
    process.stdout.write(`[${index + 1}/${candidates.length}] ${item.course} ${item.url}\n`);
    records.push(await download(item));
  }
  applyPairMetadata(records);
  await rm(tempRoot, { recursive: true, force: true });
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourcePages,
    totals: {
      sourcePages: sourcePages.length,
      files: records.length,
      passedSourceQc: records.filter((record) => record.qcStatus === "passed-source-qc").length,
      needsReview: records.filter((record) => record.qcStatus === "needs-review").length,
      rejected: records.filter((record) => record.qcStatus === "rejected").length,
      withExamSolutionPair: records.filter((record) => record.hasExamSolutionPair).length,
    },
    records,
  };
  await writeFile(path.join(examRoot, "_manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${path.relative(repoRoot, path.join(examRoot, "_manifest.json"))}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
