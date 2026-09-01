import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const MAX_PDF_BYTES = 25 * 1024 * 1024;

function cleanSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const configuredRoot = process.env.EXAM_REQUESTS_DIR?.trim();
  if (!configuredRoot) {
    return Response.json(
      { error: "Exam submissions are temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "We could not read that submission. Please try again." }, { status: 400 });
  }
  const pdf = formData.get("pdf");
  const examName = formText(formData, "examName");
  const course = formText(formData, "course");

  if (!(pdf instanceof File) || pdf.size === 0) {
    return Response.json({ error: "A PDF file is required." }, { status: 400 });
  }

  if (pdf.type && pdf.type !== "application/pdf") {
    return Response.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  if (!pdf.name.toLowerCase().endsWith(".pdf")) {
    return Response.json({ error: "The uploaded file must be a PDF." }, { status: 400 });
  }

  if (pdf.size > MAX_PDF_BYTES) {
    return Response.json({ error: "PDF must be 25 MB or smaller." }, { status: 400 });
  }

  if (!examName || !course) {
    return Response.json({ error: "Exam name and course are required." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const requestDir = path.join(configuredRoot, `${cleanSegment(course)}-${cleanSegment(examName)}-${id}`);
  try {
    await mkdir(requestDir, { recursive: true });
    await writeFile(path.join(requestDir, "exam.pdf"), Buffer.from(await pdf.arrayBuffer()));
    await writeFile(
      path.join(requestDir, "metadata.json"),
      JSON.stringify(
        {
          id,
          examName,
          course,
          teacher: formText(formData, "teacher"),
          term: formText(formData, "term"),
          notes: formText(formData, "notes"),
          originalFileName: pdf.name,
          submittedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
  } catch {
    return Response.json(
      { error: "We could not save that submission right now. Please try again later." },
      { status: 503 },
    );
  }

  return Response.json({ ok: true, id });
}
