import type { Exam } from "@/app/lib/exam-types";

export const ece313ExamTwo: Exam = {
  id: "ece313-fall-2025-e2",
  title: "ECE 313 Fall 2025 Exam 2",
  subtitle: "System properties, FIR filters, chirps, and multirate filtering",
  course: "ECE 313",
  subject: "Electrical and Computer Engineering",
  term: "Fall 2025",
  examType: "Exam 2",
  sourceNotice: "Hand-digitized from the November 13, 2025 midterm and its official solution.",
  sourceFiles: [
    {
      label: "Original exam",
      path: "exampdfs/ece313/2025-fall/exam-2-exam-without-solutions.pdf",
      role: "exam",
    },
    {
      label: "Official solution",
      path: "exampdfs/ece313/2025-fall/exam-2-solution-with-solutions.pdf",
      role: "solution",
    },
  ],
  questions: [
    {
      id: "ece313-fall-2025-e2-q1",
      title: "1. System Properties",
      points: 27,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "For each discrete-time system, decide whether it is linear, time-invariant, and causal. Inputs x[n] and outputs y[n] may be complex-valued. The source requires a proof or counterexample for every classification; a classification by itself earns no source credit.",
      formulas: [
        {
          ariaLabel: "averaging finite impulse response filter: y of n equals x of n plus x of n plus one",
          mathml: "<mrow><mi>y</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>+</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>]</mo></mrow>",
          caption: "Averaging finite impulse response filter, for all integer n.",
        },
        {
          ariaLabel: "averaging infinite impulse response filter: y of n equals zero point nine y of n minus one plus zero point one x of n, for n greater than or equal to zero",
          mathml: "<mrow><mi>y</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mn>0.9</mn><mi>y</mi><mo>[</mo><mi>n</mi><mo>−</mo><mn>1</mn><mo>]</mo><mo>+</mo><mn>0.1</mn><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>,</mo><mspace width=\".7em\"/><mi>n</mi><mo>≥</mo><mn>0</mn></mrow>",
          caption: "Averaging infinite impulse response filter; account for its unspecified initial condition.",
        },
        {
          ariaLabel: "phase modulation: y of n equals cosine of omega hat zero n plus x of n",
          mathml: "<mrow><mi>y</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant=\"normal\">cos</mi><mo>(</mo><msub><mi>ω̂</mi><mn>0</mn></msub><mi>n</mi><mo>+</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>)</mo></mrow>",
          caption: "Phase modulation, where ω̂₀ is a constant and n ranges over all integers.",
        },
      ],
      code: `A1. Averaging FIR: linear? Answer yes or no.
A2. Averaging FIR: time-invariant? Answer yes or no.
A3. Averaging FIR: causal? Answer yes or no.
B1. Averaging IIR: linear? Answer yes or no.
B2. Averaging IIR: time-invariant? Answer yes or no.
B3. Averaging IIR: causal? Answer yes or no.
C1. Phase modulation: linear? Answer yes or no.
C2. Phase modulation: time-invariant? Answer yes or no.
C3. Phase modulation: causal? Answer yes or no.`,
      answers: [
        "yes or linear",
        "yes or time-invariant",
        "no or noncausal",
        "no or nonlinear",
        "no or time-varying",
        "yes or causal",
        "no or nonlinear",
        "no or time-varying",
        "yes or causal",
      ],
      answerPoints: [1, 1, 1, 1, 1, 1, 1, 1, 1],
      workRequired: true,
      workPoints: 18,
      workRows: 14,
      workPrompt:
        "For every system, prove each positive property or give a concrete counterexample for every negative property. For the IIR system, explicitly address the unspecified y[−1] initial condition.",
      workRubric: [
        { label: "Justifies all three averaging-FIR classifications", points: 6 },
        { label: "Justifies all three averaging-IIR classifications and the initial-condition effect", points: 6 },
        { label: "Justifies all three phase-modulation classifications", points: 6 },
      ],
      officialSolution:
        "A. The averaging FIR is linear and time-invariant, but not causal because y[n] depends on future input x[n+1].\nB. With unspecified y[−1], the averaging IIR is not linear and not time-invariant; it is causal because it uses only the current input and previous output.\nC. Phase modulation is nonlinear (the zero input generally produces cos(ω̂₀n)), time-varying, and causal.",
      rubric: [
        { label: "Auto-graded classifications", points: 9 },
        { label: "Proofs and counterexamples", points: 18 },
      ],
    },
    {
      id: "ece313-fall-2025-e2-q2",
      title: "2. FIR Filter Analysis",
      points: 25,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "Consider the causal finite impulse response linear time-invariant filter below. The real-valued coefficient a is nonzero. Give the requested final forms, then use the work area to derive and justify each result.",
      formulas: [
        {
          ariaLabel: "y of n equals x of n minus a x of n minus one, for n greater than or equal to zero",
          mathml: "<mrow><mi>y</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>−</mo><mi>a</mi><mi>x</mi><mo>[</mo><mi>n</mi><mo>−</mo><mn>1</mn><mo>]</mo><mo>,</mo><mspace width=\".7em\"/><mi>n</mi><mo>≥</mo><mn>0</mn><mo>,</mo><mspace width=\".7em\"/><mi>a</mi><mo>≠</mo><mn>0</mn></mrow>",
        },
      ],
      code: `A. Give h[n].
B. Give the initial condition and its value.
C. Give H(z) and the region of convergence.
D. Give H(e^jω).
E. List both values of a that give linear phase in increasing order, separated by a comma.
F. List all possible frequency selectivities in this order: lowpass, highpass, allpass.`,
      answers: [
        "delta[n] - a delta[n-1]",
        "x[-1] = 0",
        "H(z) = 1 - a z^-1; ROC z != 0",
        "H(e^jomega) = 1 - a e^-jomega",
        "-1, 1",
        "lowpass, highpass, allpass",
      ],
      answerPoints: [1, 1, 2, 2, 2, 2],
      workRequired: true,
      workPoints: 15,
      workRows: 15,
      workPrompt:
        "Show the impulse substitution, initial-condition argument, z-transform/ROC derivation, unit-circle substitution, symmetry test, and magnitude-response reasoning. For part F, explain why bandpass and bandstop are unavailable.",
      workRubric: [
        { label: "Derives h[n] and the zero initial condition", points: 4 },
        { label: "Derives H(z), the ROC, and H(e^jω)", points: 4 },
        { label: "Uses even/odd symmetry to establish the two linear-phase values", points: 3 },
        { label: "Justifies the possible selectivities from the magnitude response", points: 4 },
      ],
      officialSolution:
        "A. h[n] = δ[n] − aδ[n−1].\nB. The required initial condition is x[−1] = 0.\nC. H(z) = 1 − az⁻¹ = (z − a)/z with ROC z ≠ 0.\nD. H(eʲω) = 1 − ae⁻ʲω.\nE. Linear phase occurs for a = −1 (even symmetry) or a = 1 (odd symmetry).\nF. The filter can be lowpass, highpass, or allpass; it cannot be bandpass or bandstop.",
      solutionFormulas: [
        {
          ariaLabel: "H of z equals one minus a z to the negative one, equal to z minus a over z, with z not equal to zero",
          mathml: "<mrow><mi>H</mi><mo>(</mo><mi>z</mi><mo>)</mo><mo>=</mo><mn>1</mn><mo>−</mo><mi>a</mi><msup><mi>z</mi><mrow><mo>−</mo><mn>1</mn></mrow></msup><mo>=</mo><mfrac><mrow><mi>z</mi><mo>−</mo><mi>a</mi></mrow><mi>z</mi></mfrac><mo>,</mo><mspace width=\".7em\"/><mi>z</mi><mo>≠</mo><mn>0</mn></mrow>",
        },
        {
          ariaLabel: "H of e to the j omega equals one minus a e to the negative j omega",
          mathml: "<mrow><mi>H</mi><mo>(</mo><msup><mi>e</mi><mrow><mi>j</mi><mi>ω</mi></mrow></msup><mo>)</mo><mo>=</mo><mn>1</mn><mo>−</mo><mi>a</mi><msup><mi>e</mi><mrow><mo>−</mo><mi>j</mi><mi>ω</mi></mrow></msup></mrow>",
        },
      ],
      rubric: [
        { label: "Auto-graded final results", points: 10 },
        { label: "Derivations and frequency-response justification", points: 15 },
      ],
    },
    {
      id: "ece313-fall-2025-e2-q3",
      title: "3. System Identification",
      points: 24,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "A discrete-time chirp sweeps from 0 to 8000 Hz in 5 seconds at fₛ = 16,000 Hz. For each output spectrogram, identify the unknown system. Part A is a filter: state its selectivity and passband/stopband. Part B is a pointwise nonlinearity: state the integer exponent k in y[n] = xᵏ[n].",
      formulas: [
        {
          ariaLabel: "chirp x of t equals cosine of two pi f one t plus two pi mu t squared, where mu equals eight hundred hertz squared",
          mathml: "<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi mathvariant=\"normal\">cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>1</mn></msub><mi>t</mi><mo>+</mo><mn>2</mn><mi>π</mi><mi>μ</mi><msup><mi>t</mi><mn>2</mn></msup><mo>)</mo><mo>,</mo><mspace width=\".8em\"/><mi>μ</mi><mo>=</mo><mn>800</mn><mtext> Hz²</mtext></mrow>",
        },
      ],
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ece313/ece313-e2-system-identification.svg",
          width: 1200,
          height: 1110,
          title: "Input and output spectrograms",
          alt: "Three recreated chirp spectrograms: an input rising from zero to eight kilohertz, a lowpass-filtered output that retains only the first two kilohertz, and a nonlinear output with additional folded N-shaped frequency traces.",
          description: "The source evidence is recreated as vector graphics so the frequency trajectories remain crisp at every size.",
        },
      ],
      code: `A1. In output (a), identify the filter selectivity.
A2. Give the passband frequency range.
A3. Give the stopband frequency range.
B. In output (b), give the integer exponent k for y[n] = x^k[n].`,
      answers: ["lowpass", "0-2 kHz or 0 to 2 kHz", "2-8 kHz or 2 to 8 kHz", "k = 3 or 3"],
      answerPoints: [1, 1, 1, 3],
      workRequired: true,
      workPoints: 18,
      workRows: 12,
      workPrompt:
        "For output (a), explain why no new frequencies appear and why the cutoff is near 2 kHz. For output (b), explain the additional 3× chirp trace, its aliasing, and why that identifies a cubic pointwise nonlinearity.",
      workRubric: [
        { label: "Explains the lowpass evidence and 0–2 kHz / 2–8 kHz ranges for output (a)", points: 9 },
        { label: "Explains the 3× component and aliasing evidence for output (b)", points: 9 },
      ],
      officialSolution:
        "A. The output contains no new frequencies, so it is an LTI lowpass filter. It passes approximately 0–2 kHz and attenuates 2–8 kHz.\nB. The added trace has three times the input chirp slope and folds at the sampling limit, which identifies y[n] = x³[n], so k = 3.",
      solutionFormulas: [
        {
          ariaLabel: "cosine cubed of f one t equals one quarter cosine of three f one t plus three quarters cosine of f one t",
          mathml: "<mrow><msup><mi mathvariant=\"normal\">cos</mi><mn>3</mn></msup><mo>(</mo><msub><mi>f</mi><mn>1</mn></msub><mi>t</mi><mo>)</mo><mo>=</mo><mfrac><mn>1</mn><mn>4</mn></mfrac><mi mathvariant=\"normal\">cos</mi><mo>(</mo><mn>3</mn><msub><mi>f</mi><mn>1</mn></msub><mi>t</mi><mo>)</mo><mo>+</mo><mfrac><mn>3</mn><mn>4</mn></mfrac><mi mathvariant=\"normal\">cos</mi><mo>(</mo><msub><mi>f</mi><mn>1</mn></msub><mi>t</mi><mo>)</mo></mrow>",
        },
      ],
      rubric: [
        { label: "Auto-graded system identifiers", points: 6 },
        { label: "Spectrogram-based justification", points: 18 },
      ],
    },
    {
      id: "ece313-fall-2025-e2-q4",
      title: "4. Upsampling, Downsampling, and Filtering",
      points: 24,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "The four analysis and synthesis filters are cascaded with ↓₂ and ↑₂ operations as shown. For each numbered system row, match its magnitude response (A–F) and decide whether its passband, defined by magnitude response at least 0.5, spans an octave.",
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ece313/ece313-e2-filterbank.svg",
          width: 1600,
          height: 1490,
          title: "Source filters, response curves, and six system rows",
          alt: "Four hand-recreated analysis and synthesis impulse-response plots, magnitude-response curves A through F, and six numbered diagrams combining lowpass or highpass filters with downsampling and upsampling by two.",
          description: "Use rows 1–6 from the diagram. All graphs and cascades are digitally redrawn from the source rather than copied from the PDF.",
        },
      ],
      code: `A1. Row 1: match A–F.
A2. Row 1: is the passband an octave? yes/no.
B1. Row 2: match A–F.
B2. Row 2: is the passband an octave? yes/no.
C1. Row 3: match A–F.
C2. Row 3: is the passband an octave? yes/no.
D1. Row 4: match A–F.
D2. Row 4: is the passband an octave? yes/no.
E1. Row 5: match A–F.
E2. Row 5: is the passband an octave? yes/no.
F1. Row 6: match A–F.
F2. Row 6: is the passband an octave? yes/no.`,
      answers: ["E", "no", "F", "yes", "D", "no", "C", "yes", "A", "no", "B", "yes"],
      answerPoints: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      workRequired: true,
      workPoints: 12,
      workRows: 13,
      workPrompt:
        "For each row, explain how the analysis filters and downsampling stages select a frequency band, and why that passband is or is not an octave under the source definition.",
      workRubric: [
        { label: "Justifies rows 1 and 2", points: 2 },
        { label: "Justifies rows 3 and 4", points: 2 },
        { label: "Justifies rows 5 and 6", points: 2 },
        { label: "Correctly relates the octave conclusion to the ≥ 0.5 passband definition", points: 6 },
      ],
      officialSolution:
        "Row 1: E, not an octave.\nRow 2: F, an octave.\nRow 3: D, not an octave.\nRow 4: C, an octave.\nRow 5: A, not an octave.\nRow 6: B, an octave.\nLowpass analysis/synthesis filters pass 0 to π/2, highpass filters pass π/2 to π, and each downsampling stage doubles the effective discrete-time frequency.",
      rubric: [
        { label: "Auto-graded response matches and octave labels", points: 12 },
        { label: "Multirate-filtering justifications", points: 12 },
      ],
    },
  ],
};
