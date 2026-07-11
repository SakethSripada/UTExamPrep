import type { MathFormula } from "@/app/lib/exam-types";

export function MathFormulaBlock({ formula }: { formula: MathFormula }) {
  return (
    <figure className="math-formula">
      <span
        aria-label={formula.ariaLabel}
        className="math-formula-expression"
        role="math"
        // Formula markup is hand-authored in the local exam data files; it is
        // never composed from learner input or a remote source.
        dangerouslySetInnerHTML={{ __html: `<math display="block">${formula.mathml}</math>` }}
      />
      {formula.caption ? <figcaption>{formula.caption}</figcaption> : null}
    </figure>
  );
}
