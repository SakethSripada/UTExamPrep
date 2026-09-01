import type { Dispatch, SetStateAction } from "react";
import { CheckCircle2, ListChecks, Play, ShieldCheck, Terminal, X } from "lucide-react";
import type { IncompleteSection, JavaRunResult, JavaStatus, ManualState, Question } from "@/app/lib/exam-types";
import { MixedContent, ScientificContent, ScientificText } from "@/app/components/mixed-content";
import { MathFormulaBlock } from "@/app/components/math-formula";
import { QuestionDiagramVisual } from "@/app/components/question-diagram";
import { gradingRubric, manualScoreForQuestion, rubricScoreKey } from "@/app/lib/exam-state";

export function CodePracticePanel() {
  return (
    <section className="java-panel code-practice-panel">
      <div className="java-panel-header">
        <div>
          <h2>
            <CheckCircle2 size={18} />
            Response saved
          </h2>
          <p>
            Code execution is temporarily unavailable. Submit when you are ready, then score each rubric criterion
            beside your response and compare it with the official solution.
          </p>
        </div>
      </div>
    </section>
  );
}

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
  const language = question.language ?? "java";
  const languageAvailable = Boolean(status?.available && (!status.languages || status.languages.includes(language)));

  if (question.runnable === false) {
    return (
      <section className="java-panel historical-code-panel">
        <div className="java-panel-header">
          <div>
            <h2>
              <Terminal size={18} />
              Code response
            </h2>
            <p>
              This archived problem depends on course-specific types or pseudocode. Your editor response is saved and
              submitted normally; compare it with the official solution in review mode.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          disabled={isLoading || !languageAvailable || !question.stub || !hasEditedCode}
        >
          <Play size={17} />
          {isLoading ? "Running" : "Run Tests"}
        </button>
      </div>

      <div className={`java-status ${status?.available ? "available" : "missing"}`}>
        <ShieldCheck size={17} />
        <span>
          {status && status.available && status.languages && !status.languages.includes(language)
            ? `${language.toUpperCase()} execution is not available on this runner.`
            : status?.message ?? "Checking code runner availability..."}
        </span>
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
  submitting,
  onClose,
  onSubmit,
  onJump,
}: {
  incompleteSections: IncompleteSection[];
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
              Your responses stay saved, and written or coding questions can be scored criterion by criterion in review mode.
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

function RubricScoreEditor({
  question,
  manual,
  setManual,
}: {
  question: Question;
  manual: ManualState;
  setManual: Dispatch<SetStateAction<ManualState>>;
}) {
  const { rubric, maximum, scope } = gradingRubric(question);
  const earned = manualScoreForQuestion(question, manual);

  const updateCriterion = (index: number, points: number, itemMaximum: number) => {
    const key = rubricScoreKey(question.id, index, scope);
    const value = Math.min(itemMaximum, Math.max(0, Number.isFinite(points) ? points : 0));
    setManual((current) => {
      const next = { ...current, [key]: value };
      delete next[question.id];
      return next;
    });
  };

  return (
    <section className="rubric-editor" aria-label="Self-grading rubric">
      <div className="rubric-score-summary" aria-live="polite">
        <div>
          <span>Self-graded score</span>
          <strong>{earned.toFixed(1)}</strong>
        </div>
        <span>/ {maximum} points</span>
      </div>
      {rubric.length ? (
        <div className="rubric rubric-inputs">
          {rubric.map((item, index) => {
            const key = rubricScoreKey(question.id, index, scope);
            const value = manual[key] ?? 0;
            return (
              <label key={item.label}>
                <span>{item.label}</span>
                <span className="criterion-score">
                  <input
                    aria-label={`${item.label} points`}
                    type="number"
                    min="0"
                    max={item.points}
                    step="0.5"
                    inputMode="decimal"
                    value={value}
                    onChange={(event) => updateCriterion(index, Number(event.target.value), item.points)}
                  />
                  <strong>/ {item.points}</strong>
                </span>
              </label>
            );
          })}
        </div>
      ) : (
        <label className="manual-score">
          <span>Your score for this response</span>
          <input
            type="number"
            min="0"
            max={maximum}
            step="0.5"
            value={manual[question.id] ?? 0}
            onChange={(event) =>
              setManual((current) => ({
                ...current,
                [question.id]: Math.min(maximum, Math.max(0, Number(event.target.value) || 0)),
              }))
            }
          />
          <strong>/ {maximum}</strong>
        </label>
      )}
    </section>
  );
}

export function ReviewPanel({
  question,
  manual,
  setManual,
  isComputerScience = true,
}: {
  question: Question;
  manual: ManualState;
  setManual: Dispatch<SetStateAction<ManualState>>;
  isComputerScience?: boolean;
}) {
  if (question.type === "short") {
    return (
      <section className="review-panel">
        <h2>
          <ListChecks size={18} />
          Correct answers{question.workPoints ? " and reasoning" : ""}
        </h2>
        <p>
          Each result field is auto-scored. Review the correct answer shown beside each response above.
          {question.workPoints
            ? " Then use the official solution to self-score the explanation you recorded during the exam."
            : ""}
        </p>
        {question.workPoints ? (
          <>
            <RubricScoreEditor question={question} manual={manual} setManual={setManual} />
          </>
        ) : null}
        {question.officialSolution ? (
          isComputerScience ? (
            <MixedContent content={question.officialSolution} language={question.language} className="solution-notes" />
          ) : (
            <ScientificContent content={question.officialSolution} className="solution-copy" />
          )
        ) : null}
        {question.solutionDiagrams?.map((diagram, index) => (
          <QuestionDiagramVisual diagram={diagram} key={`${question.id}-solution-diagram-${index}`} />
        ))}
        {question.solutionFormulas?.map((formula) => <MathFormulaBlock formula={formula} key={formula.ariaLabel} />)}
      </section>
    );
  }

  if (question.type === "choice") {
    const correct = (question.correctChoiceIds ?? []).map((choiceId) => {
      const choice = question.choices?.find((item) => item.id === choiceId);
      return choice ? `${choiceId} — ${choice.text}` : choiceId;
    });
    return (
      <section className="review-panel">
        <h2>
          <ListChecks size={18} />
          Correct answer{correct.length === 1 ? "" : "s"}
        </h2>
        <p className="correct-answer-copy">
          <strong>Correct answer{correct.length === 1 ? "" : "s"}: </strong>
          {isComputerScience ? correct.join("; ") : <ScientificText text={correct.join("; ")} />}
        </p>
      </section>
    );
  }

  if (question.type === "free-response") {
    return (
      <section className="review-panel">
        <h2>
          <ListChecks size={18} />
          Self-grade this response
        </h2>
        <p>Keep your response visible on the left. Award only the points clearly supported by what you wrote.</p>
        <RubricScoreEditor question={question} manual={manual} setManual={setManual} />
        <h3>Official answer</h3>
        {isComputerScience ? (
          <MixedContent
            content={question.officialSolution ?? question.answer}
            language={question.language}
            className="solution-notes"
          />
        ) : (
          <ScientificContent content={question.officialSolution ?? question.answer} className="solution-copy" />
        )}
      </section>
    );
  }

  return (
    <section className="review-panel">
      <h2>
        <ListChecks size={18} />
        Self-grade this code
      </h2>
      <p>Compare criterion by criterion with the response on the left. Partial credit is supported in half-point steps.</p>
      <RubricScoreEditor question={question} manual={manual} setManual={setManual} />
      <h3>Official solution</h3>
      <MixedContent content={question.answer} language={question.language} className="solution-notes" />
    </section>
  );
}
