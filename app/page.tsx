"use client";

import dynamic from "next/dynamic";
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
  Terminal,
  X,
} from "lucide-react";
import { exams } from "@/app/data/exams";
import { JavaRunnerPanel, ReviewPanel, SubmitModal } from "@/app/components/exam-panels";
import { InlineProseContent, MixedContent } from "@/app/components/mixed-content";
import type { AnswerState, Exam, FlagState, IncompleteSection, JavaRunResult, JavaRunState, JavaStatus, ManualState, Question } from "@/app/lib/exam-types";
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
} from "@/app/lib/exam-state";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="editor-loading">Loading Java editor...</div>,
});
export default function Home() {
  const [selectedExamId, setSelectedExamId] = useState(exams[0].id);
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

  const exam = exams.find((item) => item.id === selectedExamId) ?? exams[0];
  const question = exam.questions[index];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const persisted = readPersistedExam(exams[0].id);
      setAnswers(persisted.answers ?? {});
      setManual(persisted.manual ?? {});
      setFlags(persisted.flags ?? {});
      setSavedExamIds(readSavedExamIds());
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    if (
      Object.keys(answers).length === 0 &&
      Object.keys(manual).length === 0 &&
      Object.keys(flags).length === 0
    ) {
      clearPersistedExam(selectedExamId);
      return;
    }
    window.localStorage.setItem(
      `digitalexams:${selectedExamId}`,
      JSON.stringify({ answers, manual, flags }),
    );
  }, [answers, flags, manual, selectedExamId, storageReady]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/java/run")
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
            message: "Local Java status could not be checked.",
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
    let autoEarned = 0;
    let autoPossible = 0;
    let manualEarned = 0;
    let manualPossible = 0;

    for (const item of exam.questions) {
      if (item.type === "short" && item.answers) {
        autoPossible += item.points;
        const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
        item.answers.forEach((expected, answerIndex) => {
          if (isCorrect(userAnswers[answerIndex] ?? "", expected)) {
            autoEarned += item.answerPoints?.[answerIndex] ?? item.points / item.answers!.length;
          }
        });
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
      return item.answers?.every((_, answerIndex) => Boolean(userAnswers[answerIndex]?.trim())) ?? false;
    }
    return hasEditedCodeAnswer(item, answers);
  }

  function questionHasPartialAnswer(item: Question) {
    if (item.type === "short") {
      return Boolean(((answers[item.id] as string[] | undefined) ?? []).some((answer) => answer?.trim()));
    }
    return hasEditedCodeAnswer(item, answers);
  }

  function getMissingParts(item: Question) {
    if (item.type === "code") {
      return questionAnswered(item) ? [] : [{ label: "Code response", targetId: `${item.id}-editor` }];
    }
    const userAnswers = (answers[item.id] as string[] | undefined) ?? [];
    return buildObjectiveParts(item)
      .filter((part) => part.kind === "answer")
      .filter((part) => !userAnswers[part.answerIndex ?? 0]?.trim())
      .map((part) => ({
        label: `Part ${part.label}`,
        targetId: `${item.id}-part-${part.label}`,
      }));
  }

  const incompleteSections: IncompleteSection[] = exam.questions
    .map((item, questionIndex) => ({
      question: item,
      questionIndex,
      missingParts: getMissingParts(item),
    }))
    .filter((section) => section.missingParts.length > 0);

  function setShortAnswer(questionId: string, answerIndex: number, value: string) {
    setAnswers((current) => {
      const list = [...(((current[questionId] as string[] | undefined) ?? []) as string[])];
      list[answerIndex] = value;
      return { ...current, [questionId]: list };
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

  function startExam(target: Exam) {
    const persisted = readPersistedExam(target.id);
    setSelectedExamId(target.id);
    setAnswers(persisted.answers ?? {});
    setManual(persisted.manual ?? {});
    setFlags(persisted.flags ?? {});
    setMode("exam");
    setIndex(0);
    setReferenceOpen(false);
  }

  function returnToMenu() {
    setSavedExamIds(readSavedExamIds());
    setMode("menu");
  }

  async function finalizeSubmit() {
    setSubmitRunning(true);
    try {
      if (javaStatus?.available) {
        const codeQuestions = exam.questions.filter(
          (item) => item.type === "code" && hasEditedCodeAnswer(item, answers),
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
    clearAllPersistedExams();
    setAnswers({});
    setManual({});
    setFlags({});
    setJavaRuns({});
    setIndex(0);
    setReferenceOpen(false);
    setSavedExamIds([]);
  }

  function resetExam() {
    setAnswers({});
    setManual({});
    setFlags({});
    setJavaRuns({});
    setIndex(0);
    setReferenceOpen(false);
    setMode("exam");
    clearPersistedExam(selectedExamId);
    setSavedExamIds((current) => current.filter((examId) => examId !== selectedExamId));
  }

  async function runJavaTests(item: Question): Promise<JavaRunResult | null> {
    const code = ((answers[item.id] as string | undefined) ?? item.stub ?? "").trim();
    if (!hasEditedCodeAnswer(item, answers)) {
      const result = {
        ok: false,
        phase: "request",
        message: "Add code before running local tests.",
      };
      setJavaRuns((current) => ({ ...current, [item.id]: result }));
      return result;
    }
    setJavaRuns((current) => ({ ...current, [item.id]: { loading: true } }));
    try {
      const response = await fetch("/api/java/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: item.id, code }),
      });
      const result = (await response.json()) as JavaRunResult;
      setJavaRuns((current) => ({ ...current, [item.id]: result }));
      if (result.phase === "java") {
        setJavaStatus({ available: false, message: result.message });
      }
      return result;
    } catch {
      const result = {
        ok: false,
        phase: "network",
        message: "Could not reach the local Java runner.",
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
        <section className="menu-hero">
          <div>
            <h1> UT Austin CS Practice Exams</h1>
          </div>
          <button className="secondary-button" onClick={resetAllExams}>
            <RotateCcw size={17} />
            Reset All
          </button>
        </section>

        <section className="exam-list" aria-label="Available exams">
          {exams.map((item) => {
            const saved = savedExamIds.includes(item.id);
            return (
              <article className="exam-row" key={item.id}>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.subtitle}</p>
                  <span>
                    {item.questions.length} sections, {item.questions.reduce((sum, q) => sum + q.points, 0)}{" "}
                    points
                  </span>
                </div>
                <button className="primary-button" onClick={() => startExam(item)}>
                  <BookOpen size={18} />
                  {saved ? "Resume" : "Start"}
                </button>
              </article>
            );
          })}
        </section>
      </main>
    );
  }

  return (
    <main className={`exam-shell ${mode === "review" ? "review-shell" : ""}`}>
      <header className="topbar">
        <button className="icon-button" aria-label="Back to menu" onClick={returnToMenu}>
          <HomeIcon size={19} />
        </button>
        <div className="topbar-title">
          <span>{exam.title}</span>
          <strong>
            {mode === "review" ? "Review" : "In progress"} · Question {index + 1} of{" "}
            {exam.questions.length}
          </strong>
        </div>
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
              Short answer {totals.autoEarned.toFixed(1)}/{totals.autoPossible}; coding{" "}
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
                <p className="eyebrow">Scoring Mode</p>
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

          <InlineProseContent content={question.prompt} className="prompt" />
          {question.reference ? (
            <section className="reference-panel">
              <h2>Reference for this section</h2>
              <MixedContent content={question.reference} />
            </section>
          ) : null}

          {question.type === "short" && question.answers ? (
            <div className="objective-list">
              {buildObjectiveParts(question).map((part, partIndex) => {
                if (part.kind === "context") {
                  return (
                    <section className="context-block" key={`${question.id}-context-${partIndex}`}>
                      <h2>Shared context</h2>
                      <MixedContent content={part.code} />
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
                      <MixedContent content={part.code.trim()} forceCode={question.title.includes("Expressions")} />
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
                          {correct ? "Correct" : question.answers![answerIndex]}
                        </strong>
                      ) : null}
                    </label>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="editor-wrap" id={`${question.id}-editor`}>
              <MonacoEditor
                key={`${selectedExamId}-${question.id}`}
                height="430px"
                defaultLanguage="java"
                language="java"
                path={`${selectedExamId}/${question.id}.java`}
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
          )}

          {question.type === "code" ? (
            <JavaRunnerPanel
              question={question}
              status={javaStatus}
              runState={javaRuns[question.id]}
              hasEditedCode={hasEditedCodeAnswer(question, answers)}
              onRun={() => runJavaTests(question)}
            />
          ) : null}

          {mode === "review" ? <ReviewPanel question={question} manual={manual} setManual={setManual} /> : null}

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
            <MixedContent content={question.reference} />
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

