"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Code2,
  Flag,
  Home as HomeIcon,
  RotateCcw,
  Search,
  Send,
  Upload,
  Terminal,
  X,
} from "lucide-react";
import { examCatalog, loadExam } from "@/app/data/exams";
import { JavaRunnerPanel, ReviewPanel, SubmitModal } from "@/app/components/exam-panels";
import { ExamTimer } from "@/app/components/exam-timer";
import { MathFormulaBlock } from "@/app/components/math-formula";
import { InlineProseContent, MixedContent, ScientificContent, ScientificText } from "@/app/components/mixed-content";
import { QuestionDiagramVisual } from "@/app/components/question-diagram";
import type { AnswerState, Exam, ExamCatalogEntry, FlagState, IncompleteSection, JavaRunResult, JavaRunState, JavaStatus, ManualState, Question } from "@/app/lib/exam-types";
import {
  answerPlaceholder,
  buildObjectiveParts,
  clearAllPersistedExams,
  clearPersistedExam,
  hasEditedCodeAnswer,
  isCorrect,
  isSameCode,
  readPersistedExam,
  readSavedExamIds,
  workResponseKey,
} from "@/app/lib/exam-state";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading code editor...</div>,
});

const catalogExamIds = examCatalog.map((item) => item.id);

function BrandLockup() {
  return (
    <div className="brand-lockup" aria-label="UTExamPrep, UT Austin practice archive">
      <span className="brand-mark" aria-hidden="true">
        <Image src="/brand/mark.svg" alt="" width={90} height={70} priority />
      </span>
      <span className="brand-name">
        <strong>UTExamPrep</strong>
      </span>
    </div>
  );
}

// A stable, anonymous per-browser id. It is never tied to a login; the runner
// uses it only for fair per-user rate limiting (so students sharing a campus
// IP aren't throttled together) and for a rough unique-user count.
function deviceHeaders(): Record<string, string> {
  try {
    const key = "utexamprep:deviceId";
    // Carry the anonymous rate-limit id forward when someone returns after the
    // product rename, so their browser remains a single fair-use identity.
    let id = window.localStorage.getItem(key) ?? window.localStorage.getItem("digitalexams:deviceId");
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
    }
    return { "X-Device-Id": id };
  } catch {
    return {};
  }
}
export default function Home() {
  const [selectedExamId, setSelectedExamId] = useState(examCatalog[0].id);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loadingExamId, setLoadingExamId] = useState<string | null>(null);
  const [examLoadError, setExamLoadError] = useState<string | null>(null);
  const [mode, setMode] = useState<"menu" | "exam" | "review">("menu");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [manual, setManual] = useState<ManualState>({});
  const [flags, setFlags] = useState<FlagState>({});
  const [savedExamIds, setSavedExamIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [javaStatus, setJavaStatus] = useState<JavaStatus | null>(null);
  const [javaRuns, setJavaRuns] = useState<JavaRunState>({});
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitRunning, setSubmitRunning] = useState(false);
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [examRequestSent, setExamRequestSent] = useState(false);
  const [examRequestSubmitting, setExamRequestSubmitting] = useState(false);
  const [examRequestError, setExamRequestError] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const question = exam?.questions[index] ?? null;
  const isComputerScience = exam?.subject === "Computer Science";
  const useCodePresentation = Boolean(isComputerScience || question?.codePresentation);
  const subjects = ["All", ...Array.from(new Set(examCatalog.map((item) => item.subject))).sort()];
  const courses = [
    "All",
    ...Array.from(
      new Set(
        examCatalog
          .filter((item) => subjectFilter === "All" || item.subject === subjectFilter)
          .map((item) => item.course),
      ),
    ).sort(),
  ];
  const visibleExams = examCatalog.filter(
    (item) =>
      (subjectFilter === "All" || item.subject === subjectFilter) &&
      (courseFilter === "All" || item.course === courseFilter) &&
      `${item.title} ${item.course} ${item.term} ${item.examType}`
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase()),
  );
  const groupedExams = Array.from(
    visibleExams.reduce((groups, item) => {
      const group = groups.get(item.course) ?? [];
      group.push(item);
      groups.set(item.course, group);
      return groups;
    }, new Map<string, ExamCatalogEntry[]>()),
  );

  useEffect(() => {
    let cancelled = false;
    async function loadInitialExam() {
      try {
        const loaded = await loadExam(examCatalog[0].id);
        if (cancelled) {
          return;
        }
        const persisted = readPersistedExam(loaded.id, loaded);
        setExam(loaded);
        setAnswers(persisted.answers ?? {});
        setManual(persisted.manual ?? {});
        setFlags(persisted.flags ?? {});
      } catch {
        if (!cancelled) {
          setExamLoadError("The first exam could not be loaded. The catalog is still available.");
        }
      } finally {
        if (!cancelled) {
          setSavedExamIds(readSavedExamIds(catalogExamIds));
          setStorageReady(true);
        }
      }
    }
    void loadInitialExam();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    if (!exam) {
      return;
    }
    if (
      Object.keys(answers).length === 0 &&
      Object.keys(manual).length === 0 &&
      Object.keys(flags).length === 0
    ) {
      clearPersistedExam(exam.id);
      return;
    }
    window.localStorage.setItem(
      `utexamprep:${exam.id}`,
      JSON.stringify({ answers, manual, flags }),
    );
  }, [answers, exam, flags, manual, storageReady]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/java/run", { headers: deviceHeaders() })
      .then((response) => response.json() as Promise<JavaStatus>)
      .then((status) => {
        if (!cancelled) {
          setJavaStatus(status);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJavaStatus({
            available: false,
            message: "Code runner status could not be checked.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pendingTargetId) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(pendingTargetId);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = target?.querySelector("input, textarea, [tabindex]") as HTMLElement | null;
      input?.focus({ preventScroll: true });
      setPendingTargetId(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [index, pendingTargetId]);

  const totals = (() => {
    if (!exam) {
      return { autoEarned: 0, autoPossible: 0, manualEarned: 0, manualPossible: 0, earned: 0, possible: 0 };
    }
    let autoEarned = 0;
    let autoPossible = 0;
    let manualEarned = 0;
    let manualPossible = 0;

    for (const item of exam.questions) {
      if (item.type === "short" && item.answers) {
        const workPoints = Math.min(item.points, Math.max(0, item.workPoints ?? 0));
        autoPossible += item.points - workPoints;
        manualPossible += workPoints;
        manualEarned += Math.min(workPoints, Math.max(0, manual[item.id] ?? 0));
        // Points for a thrown-out part are awarded to everyone automatically.
        if (item.thrownOut) {
          autoEarned += item.thrownOut.points;
        }
        const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
        item.answers.forEach((expected, answerIndex) => {
          if (isCorrect(userAnswers[answerIndex] ?? "", expected)) {
            autoEarned += item.answerPoints?.[answerIndex] ?? (item.points - workPoints) / item.answers!.length;
          }
        });
      } else if (item.type === "choice" && item.correctChoiceIds?.length) {
        autoPossible += item.points;
        const value = answers[item.id];
        const given = Array.isArray(value) ? value : typeof value === "string" && value ? [value] : [];
        const expected = item.correctChoiceIds;
        if (given.length === expected.length && expected.every((choiceId) => given.includes(choiceId))) {
          autoEarned += item.points;
        }
      } else {
        manualPossible += item.points;
        manualEarned += Math.min(item.points, Math.max(0, manual[item.id] ?? 0));
      }
    }
    return {
      autoEarned,
      autoPossible,
      manualEarned,
      manualPossible,
      earned: autoEarned + manualEarned,
      possible: autoPossible + manualPossible,
    };
  })();

  function questionAnswered(item: Question) {
    if (item.type === "short") {
      const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
      const hasEveryResult = item.answers?.every((_, answerIndex) => Boolean(userAnswers[answerIndex]?.trim())) ?? false;
      const hasRequiredWork = !item.workRequired || Boolean((answers[workResponseKey(item.id)] as string | undefined)?.trim());
      return hasEveryResult && hasRequiredWork;
    }
    if (item.type === "choice") {
      const value = answers[item.id];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }
    if (item.type === "free-response") {
      return Boolean(manual[item.id] || ((answers[item.id] as string | undefined) ?? "").trim());
    }
    return hasEditedCodeAnswer(item, answers);
  }

  function questionHasPartialAnswer(item: Question) {
    if (item.type === "short") {
      return Boolean(
        ((answers[item.id] as string[] | undefined) ?? []).some((answer) => answer?.trim()) ||
          (answers[workResponseKey(item.id)] as string | undefined)?.trim(),
      );
    }
    if (item.type === "choice") {
      const value = answers[item.id];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }
    if (item.type === "free-response") {
      return Boolean(((answers[item.id] as string | undefined) ?? "").trim());
    }
    return hasEditedCodeAnswer(item, answers);
  }

  function getMissingParts(item: Question) {
    if (item.type === "code") {
      return questionAnswered(item) ? [] : [{ label: "Code response", targetId: `${item.id}-editor` }];
    }
    if (item.type === "choice") {
      return questionAnswered(item) ? [] : [{ label: "Selected answer", targetId: `${item.id}-choices` }];
    }
    if (item.type === "free-response") {
      return questionAnswered(item) ? [] : [{ label: "Self-graded response", targetId: `${item.id}-free-response` }];
    }
    const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
    const missing = !item.code
      ? userAnswers[0]?.trim()
        ? []
        : [{ label: "Answer", targetId: `${item.id}-answer` }]
      : buildObjectiveParts(item)
          .filter((part) => part.kind === "answer")
          .filter((part) => !userAnswers[part.answerIndex ?? 0]?.trim())
          .map((part) => ({
            label: `Part ${part.label}`,
            targetId: `${item.id}-part-${part.label}`,
          }));
    if (item.workRequired && !(answers[workResponseKey(item.id)] as string | undefined)?.trim()) {
      missing.push({ label: "Reasoning", targetId: `${item.id}-work` });
    }
    return missing;
  }

  const incompleteSections: IncompleteSection[] = exam
    ? exam.questions
        .map((item, questionIndex) => ({
          question: item,
          questionIndex,
          missingParts: getMissingParts(item),
        }))
        .filter((section) => section.missingParts.length > 0)
    : [];

  function setShortAnswer(questionId: string, answerIndex: number, value: string) {
    setAnswers((current) => {
      const list = [...(((current[questionId] as string[] | undefined) ?? []) as string[])];
      list[answerIndex] = value;
      return { ...current, [questionId]: list };
    });
  }

  function setWorkResponse(questionId: string, value: string) {
    const key = workResponseKey(questionId);
    setAnswers((current) => {
      if (!value.trim()) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: value };
    });
  }

  function setCodeAnswer(item: Question, value: string | undefined) {
    setAnswers((current) => {
      const next = { ...current };
      const code = value ?? "";
      if (!code.trim() || isSameCode(code, item.stub)) {
        delete next[item.id];
      } else {
        next[item.id] = code;
      }
      return next;
    });
  }

  function setChoiceAnswer(item: Question, choiceId: string, checked: boolean) {
    setAnswers((current) => {
      if (item.allowMultiple) {
        const previous = Array.isArray(current[item.id]) ? ([...(current[item.id] as string[])] as string[]) : [];
        const next = checked ? Array.from(new Set([...previous, choiceId])) : previous.filter((id) => id !== choiceId);
        if (next.length === 0) {
          const copy = { ...current };
          delete copy[item.id];
          return copy;
        }
        return { ...current, [item.id]: next };
      }
      return { ...current, [item.id]: checked ? choiceId : "" };
    });
  }

  function setFreeResponse(questionId: string, value: string) {
    setAnswers((current) => {
      if (!value.trim()) {
        const next = { ...current };
        delete next[questionId];
        return next;
      }
      return { ...current, [questionId]: value };
    });
  }

  async function startExam(target: ExamCatalogEntry) {
    setExamLoadError(null);
    setLoadingExamId(target.id);
    try {
      const loaded = await loadExam(target.id);
      const persisted = readPersistedExam(loaded.id, loaded);
      setSelectedExamId(loaded.id);
      setExam(loaded);
      setAnswers(persisted.answers ?? {});
      setManual(persisted.manual ?? {});
      setFlags(persisted.flags ?? {});
      setJavaRuns({});
      setMode("exam");
      setIndex(0);
      setReferenceOpen(false);
    } catch {
      setExamLoadError(`Could not load ${target.title}.`);
    } finally {
      setLoadingExamId(null);
    }
  }

  function returnToMenu() {
    setSavedExamIds(readSavedExamIds(catalogExamIds));
    setMode("menu");
  }

  async function finalizeSubmit() {
    if (!exam) {
      return;
    }
    setSubmitRunning(true);
    try {
      if (javaStatus?.available) {
        const codeQuestions = exam.questions.filter(
          (item) =>
            item.type === "code" &&
            item.runnable !== false &&
            hasEditedCodeAnswer(item, answers) &&
            (!javaStatus.languages || javaStatus.languages.includes(item.language ?? "java")),
        );
        const results = await Promise.all(
          codeQuestions.map(async (item) => ({
            item,
            result: await runJavaTests(item),
          })),
        );
        setManual((current) => {
          const next = { ...current };
          for (const { item, result } of results) {
            if (result && typeof result.passed === "number" && typeof result.total === "number" && result.total > 0) {
              next[item.id] = Math.round((item.points * result.passed * 10) / result.total) / 10;
            }
          }
          return next;
        });
      }
      setMode("review");
    } finally {
      setSubmitRunning(false);
    }
  }

  function requestSubmit() {
    if (!exam) {
      return;
    }
    if (incompleteSections.length > 0) {
      setSubmitModalOpen(true);
      return;
    }
    void finalizeSubmit();
  }

  function submitAnyway() {
    setSubmitModalOpen(false);
    void finalizeSubmit();
  }

  function resetAllExams() {
    clearAllPersistedExams(catalogExamIds);
    setAnswers({});
    setManual({});
    setFlags({});
    setJavaRuns({});
    setIndex(0);
    setReferenceOpen(false);
    setSavedExamIds([]);
  }

  function resetExam() {
    if (!exam) {
      return;
    }
    setAnswers({});
    setManual({});
    setFlags({});
    setJavaRuns({});
    setIndex(0);
    setReferenceOpen(false);
    setMode("exam");
    clearPersistedExam(exam.id);
    setSavedExamIds((current) => current.filter((examId) => examId !== exam.id));
  }

  async function submitExamRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExamRequestSubmitting(true);
    setExamRequestError(null);
    try {
      const response = await fetch("/api/exam-requests", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error ?? "Could not submit the request.");
      }
      event.currentTarget.reset();
      setExamRequestSent(true);
    } catch (error) {
      setExamRequestError(error instanceof Error ? error.message : "Could not submit the request.");
    } finally {
      setExamRequestSubmitting(false);
    }
  }

  async function runJavaTests(item: Question): Promise<JavaRunResult | null> {
    if (item.runnable === false) {
      return null;
    }
    const code = ((answers[item.id] as string | undefined) ?? item.stub ?? "").trim();
    if (!hasEditedCodeAnswer(item, answers)) {
      const result = {
        ok: false,
        phase: "request",
        message: "Add code before running tests.",
      };
      setJavaRuns((current) => ({ ...current, [item.id]: result }));
      return result;
    }
    setJavaRuns((current) => ({ ...current, [item.id]: { loading: true } }));
    try {
      const response = await fetch("/api/java/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...deviceHeaders() },
        body: JSON.stringify({ questionId: item.id, code, language: item.language ?? "java" }),
      });
      const result = (await response.json()) as JavaRunResult;
      setJavaRuns((current) => ({ ...current, [item.id]: result }));
      if (result.phase === "runtime" || result.phase === "java") {
        setJavaStatus({ available: false, message: result.message });
      }
      return result;
    } catch {
      const result = {
        ok: false,
        phase: "network",
        message: "Could not reach the code runner.",
      };
      setJavaRuns((current) => ({
        ...current,
        [item.id]: result,
      }));
      return result;
    }
  }

  if (mode === "menu") {
    return (
      <main className="exam-shell menu-shell">
        <header className="site-header">
          <BrandLockup />
          <div className="menu-actions">
            <button className="secondary-button" onClick={() => setRequestModalOpen(true)}>
              <Upload size={17} />
              Add exam
            </button>
            <button className="quiet-button" onClick={resetAllExams}>
              <RotateCcw size={17} />
              Reset progress
            </button>
          </div>
        </header>

        <section className="menu-hero" aria-labelledby="home-title">
          <h1 id="home-title">Digitized Past Exams</h1>
        </section>

        {examLoadError ? <p className="catalog-error">{examLoadError}</p> : null}

        <section className="catalog-panel" aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="sr-only">Exam library</h2>

          <div className="catalog-filters" aria-label="Exam filters">
            <label className="catalog-search">
              <span>Search Exams</span>
              <span className="search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Course, term, or exam"
                />
              </span>
            </label>
            <label>
              <span>Subject</span>
              <select
                value={subjectFilter}
                onChange={(event) => {
                  setSubjectFilter(event.target.value);
                  setCourseFilter("All");
                }}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Course</span>
              <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="exam-list" aria-label="Available exams">
          {groupedExams.map(([course, items]) => (
            <section className="course-group" key={course}>
              <header className="course-heading">
                <div>
                  <h2>{course}</h2>
                </div>
              </header>
              {items.map((item) => {
                const saved = savedExamIds.includes(item.id);
                const loading = loadingExamId === item.id;
                return (
                  <article className="exam-row" key={item.id}>
                    <div className="exam-row-copy">
                      <h3>{item.title}</h3>
                    </div>
                    <button className="primary-button" onClick={() => void startExam(item)} disabled={loading}>
                      <BookOpen size={18} />
                      {loading ? "Loading" : saved ? "Resume exam" : "Start exam"}
                    </button>
                  </article>
                );
              })}
            </section>
          ))}
          {groupedExams.length === 0 ? <p className="empty-catalog">No exams match those filters.</p> : null}
        </section>

        {requestModalOpen ? (
          <div className="modal-backdrop" role="presentation">
            <section className="request-modal" role="dialog" aria-modal="true" aria-labelledby="exam-request-title">
              <div className="modal-heading">
                <div>
                  <h2 id="exam-request-title">Add an Exam</h2>
                  <p>Upload the PDF and add whatever details help identify the class and instructor.</p>
                </div>
                <button
                  className="modal-close"
                  aria-label="Close request dialog"
                  onClick={() => {
                    setRequestModalOpen(false);
                    setExamRequestSent(false);
                    setExamRequestError(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {examRequestSent ? (
                <div className="request-success">
                  <strong>Request submitted.</strong>
                  <p>The PDF and details were saved locally in the exam request inbox.</p>
                  <button
                    className="primary-button"
                    onClick={() => {
                      setRequestModalOpen(false);
                      setExamRequestSent(false);
                      setExamRequestError(null);
                    }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form className="request-form" onSubmit={submitExamRequest}>
                  <label className="file-drop">
                    <Upload size={22} />
                    <span>PDF file</span>
                    <input type="file" name="pdf" accept="application/pdf,.pdf" required disabled={examRequestSubmitting} />
                  </label>

                  <div className="request-field-grid">
                    <label>
                      <span>Exam name</span>
                      <input name="examName" placeholder="Midterm 2, Final, Sample CBE..." required disabled={examRequestSubmitting} />
                    </label>
                    <label>
                      <span>Course</span>
                      <input name="course" placeholder="CS 312" required disabled={examRequestSubmitting} />
                    </label>
                    <label>
                      <span>Teacher</span>
                      <input name="teacher" placeholder="Instructor name" disabled={examRequestSubmitting} />
                    </label>
                    <label>
                      <span>Term</span>
                      <input name="term" placeholder="Fall 2025" disabled={examRequestSubmitting} />
                    </label>
                  </div>

                  <label>
                    <span>Anything else?</span>
                    <textarea
                      name="notes"
                      rows={4}
                      placeholder="Solutions included, topics covered, preferred title..."
                      disabled={examRequestSubmitting}
                    />
                  </label>

                  {examRequestError ? <p className="form-error">{examRequestError}</p> : null}

                  <div className="modal-actions">
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={examRequestSubmitting}
                      onClick={() => {
                        setRequestModalOpen(false);
                        setExamRequestSent(false);
                        setExamRequestError(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button className="primary-button" type="submit" disabled={examRequestSubmitting}>
                      <Send size={17} />
                      {examRequestSubmitting ? "Submitting" : "Submit Request"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        ) : null}
      </main>
    );
  }

  if (!exam || !question) {
    return (
      <main className="exam-shell loading-shell">
        <section className="loading-panel">
          <h1>Loading exam</h1>
          <p>Preparing the selected practice exam.</p>
          <button className="secondary-button" onClick={returnToMenu}>
            <HomeIcon size={17} />
            Back to Menu
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className={`exam-shell ${mode === "review" ? "review-shell" : ""} ${isComputerScience ? "cs-exam" : "science-exam"}`}>
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button" aria-label="Back to menu" onClick={returnToMenu}>
            <HomeIcon size={19} />
          </button>
          <div className="topbar-title">
            <span>{exam.title}</span>
          </div>
        </div>
        {mode === "exam" ? (
          <ExamTimer />
        ) : (
          <div className="review-mode-indicator" role="status">
            Review mode
          </div>
        )}
        <div className="topbar-actions">
          <button className="secondary-button" onClick={resetExam}>
            <RotateCcw size={17} />
            Reset
          </button>
          {mode === "exam" ? (
            <button className="primary-button" onClick={requestSubmit} disabled={submitRunning}>
              <ClipboardCheck size={17} />
              {submitRunning ? "Grading" : "Submit"}
            </button>
          ) : (
            <button className="primary-button" onClick={() => setMode("exam")}>
              <Code2 size={17} />
              Continue Editing
            </button>
          )}
        </div>
      </header>

      <div className="workbench">
        <aside className="navigator" aria-label="Question navigator">
          <div className="score-panel">
            <span>Total Score</span>
            <strong>
              {totals.earned.toFixed(1)} / {totals.possible}
            </strong>
            <small>
              Auto-graded {totals.autoEarned.toFixed(1)}/{totals.autoPossible}; self-graded{" "}
              {totals.manualEarned}/{totals.manualPossible}
            </small>
          </div>
          <div className="question-map">
            {exam.questions.map((item, qIndex) => {
              const isComplete = questionAnswered(item);
              const isPartial = !isComplete && questionHasPartialAnswer(item);
              const itemRun = javaRuns[item.id];
              const passedJava = itemRun && !("loading" in itemRun) && itemRun.ok;
              const failedJava = itemRun && !("loading" in itemRun) && !itemRun.ok;
              return (
                <button
                  className={`map-item ${qIndex === index ? "active" : ""}`}
                  key={item.id}
                  aria-current={qIndex === index ? "step" : undefined}
                  onClick={() => {
                    setIndex(qIndex);
                    setReferenceOpen(false);
                  }}
                >
                  <span className="map-number">{qIndex + 1}</span>
                  <span className="map-copy">
                    <strong>{item.title.replace(/^\d+\.\s*/, "")}</strong>
                    <small>{item.points} pts</small>
                  </span>
                  <span className="map-badges">
                    {flags[item.id] ? (
                      <span className="map-badge flagged">
                        <Flag size={12} />
                      </span>
                    ) : null}
                    {passedJava ? (
                      <span className="map-badge passed">
                        <Terminal size={12} />
                      </span>
                    ) : failedJava ? (
                      <span className="map-badge failed">
                        <Terminal size={12} />
                      </span>
                    ) : isComplete ? (
                      <span className="map-badge answered">
                        <Check size={12} />
                      </span>
                    ) : isPartial ? (
                      <span className="map-badge partial" aria-label="Partially answered" />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="question-pane">
          {mode === "review" ? (
            <section className="review-banner">
              <div>
                <p className="eyebrow">Score summary</p>
                <h2>
                  {totals.earned.toFixed(1)} / {totals.possible} points
                </h2>
              </div>
              <p>
                Answers are locked while reviewing. Use Continue Editing to return to the exam and make
                changes.
              </p>
            </section>
          ) : null}

          <div className="question-header">
            <div>
              <p className="eyebrow">{question.points} points</p>
              <h1>{question.title}</h1>
            </div>
            <button
              className={`flag-button ${flags[question.id] ? "flagged" : ""}`}
              onClick={() => setFlags((current) => ({ ...current, [question.id]: !current[question.id] }))}
              disabled={mode === "review"}
            >
              <Flag size={17} />
              Flag
            </button>
          </div>

          {useCodePresentation ? (
            <InlineProseContent
              content={question.prompt}
              codeContext={[question.reference, question.stub, question.code].filter(Boolean).join("\n")}
              className="prompt"
            />
          ) : (
            <ScientificContent content={question.prompt} className="prompt" />
          )}
          {question.formulas?.map((formula) => <MathFormulaBlock formula={formula} key={formula.ariaLabel} />)}
          {question.reference ? (
            <section className="reference-panel">
              <h2>Reference for this section</h2>
              {useCodePresentation ? (
                <MixedContent content={question.reference} language={question.language} />
              ) : (
                <ScientificContent content={question.reference} />
              )}
            </section>
          ) : null}
          {question.image ? (
            <figure className="question-figure">
              <Image
                src={question.image}
                alt={question.imageAlt ?? ""}
                width={question.imageWidth ?? 300}
                height={question.imageHeight ?? 325}
                sizes="(max-width: 900px) 100vw, 850px"
              />
            </figure>
          ) : null}
          {question.diagrams?.map((diagram, diagramIndex) => (
            <QuestionDiagramVisual diagram={diagram} key={`${question.id}-diagram-${diagramIndex}`} />
          ))}

          {question.type === "short" && question.answers ? (
            <div className="objective-list">
              {!question.code ? (
                <label className="single-answer" id={`${question.id}-answer`}>
                  <span>Your answer</span>
                  <input
                    disabled={mode === "review"}
                    value={((answers[question.id] as string[] | undefined) ?? [])[0] ?? ""}
                    onChange={(event) => setShortAnswer(question.id, 0, event.target.value)}
                    placeholder="Type your answer"
                  />
                  {mode === "review" ? (
                    <strong
                      className={
                        isCorrect(
                          ((answers[question.id] as string[] | undefined) ?? [])[0] ?? "",
                          question.answers[0],
                        )
                          ? "correct"
                          : "incorrect"
                      }
                    >
                      Correct answer:{" "}
                      {useCodePresentation ? question.answers[0] : <ScientificText text={question.answers[0]} />}
                    </strong>
                  ) : null}
                </label>
              ) : buildObjectiveParts(question).map((part, partIndex) => {
                if (part.kind === "context") {
                  return (
                    <section className="context-block" key={`${question.id}-context-${partIndex}`}>
                      <h2>{useCodePresentation ? "Shared context" : "Use these labels"}</h2>
                      <MixedContent content={part.code} />
                    </section>
                  );
                }

                if (part.kind === "thrown") {
                  return (
                    <section className="objective-part thrown-out" key={`${question.id}-thrown-${part.label}`}>
                      <div className="part-code">
                        <div className="part-label">{part.label}</div>
                        <p className="thrown-out-note">{part.note}</p>
                      </div>
                    </section>
                  );
                }

                const answerIndex = part.answerIndex ?? 0;
                const userAnswers = (answers[question.id] as string[] | undefined) ?? [];
                const submitted = mode === "review";
                const correct = submitted && isCorrect(userAnswers[answerIndex] ?? "", question.answers![answerIndex]);
                const partTargetId = `${question.id}-part-${part.label}`;
                return (
                  <section className="objective-part" id={partTargetId} key={`${question.id}-${answerIndex}`}>
                    <div className="part-code">
                      <div className="part-label">{part.label}</div>
                      {useCodePresentation ? (
                        <MixedContent
                          content={part.code.trim()}
                          forceCode={question.title.includes("Expressions")}
                          language={question.language}
                        />
                      ) : (
                        <ScientificContent content={part.code.trim()} className="structured-science-content" />
                      )}
                    </div>
                    <label className="answer-line">
                      <span>Answer {part.label}</span>
                      <input
                        disabled={mode === "review"}
                        value={userAnswers[answerIndex] ?? ""}
                        onChange={(event) => setShortAnswer(question.id, answerIndex, event.target.value)}
                        placeholder={answerPlaceholder(part)}
                      />
                      {submitted ? (
                        <strong className={correct ? "correct" : "incorrect"}>
                          Correct answer:{" "}
                          {useCodePresentation ? (
                            question.answers![answerIndex]
                          ) : (
                            <ScientificText text={question.answers![answerIndex]} />
                          )}
                        </strong>
                      ) : null}
                    </label>
                  </section>
                );
              })}
            </div>
          ) : null}

          {question.type === "short" && question.workPrompt ? (
            <section className="short-answer-work" id={`${question.id}-work`}>
              <label>
                <strong>{question.workRequired ? "Show your work (required)" : "Show your work"}</strong>
                <p>{question.workPrompt}</p>
                <textarea
                  disabled={mode === "review"}
                  value={(answers[workResponseKey(question.id)] as string | undefined) ?? ""}
                  onChange={(event) => setWorkResponse(question.id, event.target.value)}
                  placeholder={question.workPlaceholder ?? "Write your derivation or explanation here."}
                  rows={question.workRows ?? 8}
                />
              </label>
            </section>
          ) : null}

          {question.type === "choice" && question.choices ? (
            <div className="choice-list" id={`${question.id}-choices`}>
              {question.choices.map((choice) => {
                const value = answers[question.id];
                const selected = Array.isArray(value) ? value.includes(choice.id) : value === choice.id;
                const submitted = mode === "review";
                const correct = Boolean(question.correctChoiceIds?.includes(choice.id));
                return (
                  <label
                    className={`choice-option-row ${submitted && correct ? "correct" : ""} ${
                      submitted && selected && !correct ? "incorrect" : ""
                    }`}
                    key={choice.id}
                  >
                    <input
                      type={question.allowMultiple ? "checkbox" : "radio"}
                      name={question.id}
                      value={choice.id}
                      checked={selected}
                      disabled={mode === "review"}
                      onChange={(event) => setChoiceAnswer(question, choice.id, event.target.checked)}
                    />
                    <strong>{choice.id}</strong>
                    <span>{isComputerScience ? choice.text : <ScientificText text={choice.text} />}</span>
                  </label>
                );
              })}
            </div>
          ) : null}

          {question.type === "free-response" ? (
            <section className="free-response" id={`${question.id}-free-response`}>
              <textarea
                value={(answers[question.id] as string | undefined) ?? ""}
                disabled={mode === "review"}
                onChange={(event) => setFreeResponse(question.id, event.target.value)}
                placeholder="Work the problem here, then self-score against the correct answer after submitting."
                rows={10}
              />
            </section>
          ) : null}

          {question.type === "code" ? (
            <div className="editor-wrap" id={`${question.id}-editor`}>
              <MonacoEditor
                key={`${selectedExamId}-${question.id}`}
                height="430px"
                defaultLanguage={question.language ?? "java"}
                language={question.language ?? "java"}
                path={`${selectedExamId}/${question.id}.${question.language === "python" ? "py" : question.language === "c" ? "c" : "java"}`}
                theme="vs"
                value={(answers[question.id] as string | undefined) ?? question.stub ?? ""}
                onChange={(value) => setCodeAnswer(question, value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 22,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 4,
                  automaticLayout: true,
                  readOnly: mode === "review",
                }}
              />
            </div>
          ) : null}

          {question.type === "code" ? (
            <JavaRunnerPanel
              question={question}
              status={javaStatus}
              runState={javaRuns[question.id]}
              hasEditedCode={hasEditedCodeAnswer(question, answers)}
              onRun={() => runJavaTests(question)}
            />
          ) : null}

          {mode === "review" ? (
            <ReviewPanel
              question={question}
              manual={manual}
              setManual={setManual}
              isComputerScience={useCodePresentation}
            />
          ) : null}

          <div className="question-footer">
            <button
              className="secondary-button"
              disabled={index === 0}
              onClick={() => {
                setIndex(index - 1);
                setReferenceOpen(false);
              }}
            >
              <ChevronLeft size={17} />
              Previous
            </button>
            <button
              className="secondary-button"
              disabled={index === exam.questions.length - 1}
              onClick={() => {
                setIndex(index + 1);
                setReferenceOpen(false);
              }}
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </div>
      {question.reference ? (
        <>
          <button
            className="floating-reference-button"
            type="button"
            aria-expanded={referenceOpen}
            aria-controls="floating-reference-panel"
            onClick={() => setReferenceOpen((open) => !open)}
          >
            <BookOpen size={17} />
            Reference
          </button>
          <aside
            className={`floating-reference-panel ${referenceOpen ? "open" : ""}`}
            id="floating-reference-panel"
            aria-hidden={!referenceOpen}
            aria-label="Reference for this section"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            <div className="floating-reference-heading">
              <div>
                <span>Reference</span>
                <strong>{question.title.replace(/^\d+\.\s*/, "")}</strong>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close reference"
                onClick={() => setReferenceOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            {useCodePresentation ? (
              <MixedContent content={question.reference} language={question.language} />
            ) : (
              <ScientificContent content={question.reference} />
            )}
          </aside>
        </>
      ) : null}
      {submitModalOpen ? (
        <SubmitModal
          incompleteSections={incompleteSections}
          javaAvailable={Boolean(javaStatus?.available)}
          submitting={submitRunning}
          onClose={() => setSubmitModalOpen(false)}
          onSubmit={submitAnyway}
          onJump={(targetIndex, targetId) => {
            setSubmitModalOpen(false);
            if (targetIndex >= 0) {
              setIndex(targetIndex);
              setReferenceOpen(false);
              setPendingTargetId(targetId ?? null);
            }
          }}
        />
      ) : null}
    </main>
  );
}
