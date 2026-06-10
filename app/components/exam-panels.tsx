import type { Dispatch, SetStateAction } from "react";
import { ListChecks, Play, ShieldCheck, Terminal, X } from "lucide-react";
import type { IncompleteSection, JavaRunResult, JavaStatus, ManualState, Question } from "@/app/lib/exam-types";
import { CodeBlock } from "@/app/components/mixed-content";

export function JavaRunnerPanel({
  question,
  status,
  runState,
  hasEditedCode,
  onRun,
}: {
  question: Question;
  status: JavaStatus | null;
  runState?: JavaRunResult | { loading: true };
  hasEditedCode: boolean;
  onRun: () => void;
}) {
  const isLoading = Boolean(runState && "loading" in runState);
  const result = runState && !("loading" in runState) ? runState : null;

  return (
    <section className="java-panel">
      <div className="java-panel-header">
        <div>
          <h2>
            <Terminal size={18} />
            Tests
          </h2>
        </div>
        <button
          className="primary-button"
          onClick={onRun}
          disabled={isLoading || status?.available === false || !question.stub || !hasEditedCode}
        >
          <Play size={17} />
          {isLoading ? "Running" : "Run Tests"}
        </button>
      </div>

      <div className={`java-status ${status?.available ? "available" : "missing"}`}>
        <ShieldCheck size={17} />
        <span>{status?.message ?? "Checking Java runner availability..."}</span>
      </div>
      {!hasEditedCode ? <p className="java-hint">Edit the starter code to enable tests.</p> : null}

      {result ? (
        <div className={`java-result ${result.ok ? "passed" : "failed"}`}>
          <strong>{result.message}</strong>
          {typeof result.passed === "number" && typeof result.total === "number" ? (
            <span className="java-estimate">
              Test estimate: {result.passed}/{result.total} checks passed
            </span>
          ) : null}
          {result.stdout ? <pre>{result.stdout}</pre> : null}
          {result.stderr ? <pre>{result.stderr}</pre> : null}
        </div>
      ) : null}
    </section>
  );
}

export function SubmitModal({
  incompleteSections,
  javaAvailable,
  submitting,
  onClose,
  onSubmit,
  onJump,
}: {
  incompleteSections: IncompleteSection[];
  javaAvailable: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onJump: (index: number, targetId?: string) => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="submit-modal" role="dialog" aria-modal="true" aria-labelledby="submit-title">
        <div className="modal-heading">
          <div>
            <h2 id="submit-title">Submit exam?</h2>
            <p>
              {incompleteSections.length} section{incompleteSections.length === 1 ? " is" : "s are"} still
              incomplete. Jump back to a section, continue editing, or submit anyway.
              {javaAvailable ? " Answered code questions will be tested locally before scoring." : ""}
            </p>
          </div>
          <button className="modal-close" aria-label="Close submit dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="incomplete-list">
          {incompleteSections.map((section) => (
            <details key={section.question.id} open>
              <summary>
                <span>{section.question.title}</span>
                <strong>
                  {section.missingParts.length} missing · {section.question.points} pts
                </strong>
              </summary>
              <div className="missing-parts">
                {section.missingParts.map((part) => (
                  <button key={part.label} onClick={() => onJump(section.questionIndex, part.targetId)}>
                    {part.label}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} disabled={submitting}>
            Continue Editing
          </button>
          <button className="primary-button" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Grading" : "Submit Anyway"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function ReviewPanel({
  question,
  manual,
  setManual,
}: {
  question: Question;
  manual: ManualState;
  setManual: Dispatch<SetStateAction<ManualState>>;
}) {
  if (question.type === "short") {
    return (
      <section className="review-panel">
        <h2>
          <ListChecks size={18} />
          Official Answers
        </h2>
        <p>Each item is auto-scored. Spelling and type markers such as quotes still matter.</p>
      </section>
    );
  }

  return (
    <section className="review-panel">
      <h2>
        <ListChecks size={18} />
        Coding Score
      </h2>
      <label className="manual-score">
        <span>Your score for this problem</span>
        <input
          type="number"
          min="0"
          max={question.points}
          step="1"
          value={manual[question.id] ?? 0}
          onChange={(event) =>
            setManual((current) => ({
              ...current,
              [question.id]: Number(event.target.value),
            }))
          }
        />
        <strong>/ {question.points}</strong>
      </label>
      <div className="rubric">
        {question.rubric?.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.points}</strong>
          </div>
        ))}
      </div>
      <h3>Official solution</h3>
      <CodeBlock code={question.answer} className="solution" />
    </section>
  );
}
