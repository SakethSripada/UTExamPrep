import type { Dispatch, SetStateAction } from "react";
import { ListChecks, Play, ShieldCheck, Terminal, X } from "lucide-react";
import type { IncompleteSection, JavaRunResult, JavaStatus, ManualState, Question } from "@/app/lib/exam-types";
import { MixedContent, ScientificContent, ScientificText } from "@/app/components/mixed-content";
import { MathFormulaBlock } from "@/app/components/math-formula";
import { QuestionDiagramVisual } from "@/app/components/question-diagram";

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
            <label className="manual-score">
              <span>Reasoning and work score</span>
              <input
                type="number"
                min="0"
                max={question.workPoints}
                step="0.5"
                value={manual[question.id] ?? 0}
                onChange={(event) =>
                  setManual((current) => ({
                    ...current,
                    [question.id]: Number(event.target.value),
                  }))
                }
              />
              <strong>/ {question.workPoints}</strong>
            </label>
            <div className="rubric">
              {question.workRubric?.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.points}</strong>
                </div>
              ))}
            </div>
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
          Self-Grade
        </h2>
        <label className="manual-score">
          <span>Your score for this problem</span>
          <input
            type="number"
            min="0"
            max={question.points}
            step="0.5"
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
        <h3>Correct answer</h3>
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
      <MixedContent content={question.answer} language={question.language} className="solution-notes" />
    </section>
  );
}
