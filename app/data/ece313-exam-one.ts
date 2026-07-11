import type { Exam } from "@/app/lib/exam-types";

export const ece313ExamOne: Exam = {
  id: "ece313-fall-2025-e1",
  title: "ECE 313 Fall 2025 Exam 1",
  subtitle: "Sinusoids, Fourier series, sampling, and time-frequency analysis",
  course: "ECE 313",
  subject: "Electrical and Computer Engineering",
  term: "Fall 2025",
  examType: "Exam 1",
  sourceNotice: "Hand-digitized from the October 2, 2025 midterm and its official solution. A documented correction is shown in Problem 4.",
  sourceFiles: [
    {
      label: "Original exam",
      path: "exampdfs/ece313/2025-fall/exam-1-exam-without-solutions.pdf",
      role: "exam",
    },
    {
      label: "Official solution",
      path: "exampdfs/ece313/2025-fall/exam-1-solution-with-solutions.pdf",
      role: "solution",
    },
  ],
  questions: [
    {
      id: "ece313-fall-2025-e1-q1",
      title: "1. Sinusoidal Signals",
      points: 24,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "Consider the sinusoidal signal below. A is its amplitude, f₀ is its continuous-time frequency in hertz, and θ is its phase in radians. Use the plotted signal to answer each part.",
      formulas: [
        {
          ariaLabel: "x of t equals A times sine of two pi f sub zero t plus theta",
          mathml:
            "<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi>A</mi><mo>&InvisibleTimes;</mo><mi mathvariant=\"normal\">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>t</mi><mo>+</mo><mi>θ</mi><mo>)</mo></mrow>",
        },
      ],
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ece313/ece313-e1-sinusoid.svg",
          width: 1000,
          height: 560,
          title: "Source signal",
          alt: "A sinusoidal signal from minus eight to twelve milliseconds with a positive amplitude of two and a period of four milliseconds.",
          description: "The recreated graph preserves the source scale: −8 to 12 milliseconds horizontally and −2 to 2 vertically.",
        },
      ],
      code: `A. Estimate the amplitude A.
B. Estimate the continuous-time frequency f₀ in Hz.
C. Estimate the phase θ in radians.
D. What is the phase of x(t − 0.001)?`,
      answers: ["2", "250 Hz", "0 rad", "−π/2 or −0.5π or -pi/2"],
      answerPoints: [3, 3, 3, 3],
      workRequired: true,
      workPoints: 12,
      workRows: 10,
      workPrompt:
        "Explain how the graph gives each estimate. For part D, show the time-shift substitution and the intermediate phase calculation. The final values above are auto-scored; this reasoning is scored during review.",
      workRubric: [
        { label: "Explains the peak-to-zero amplitude reading for A", points: 3 },
        { label: "Uses the 4 ms period (or five cycles in 20 ms) to find f₀", points: 3 },
        { label: "Relates the zero crossing at t = 0 to θ", points: 3 },
        { label: "Shows the phase-shift calculation for x(t − 0.001)", points: 3 },
      ],
      officialSolution:
        "A. The peaks and valleys are at ±2, so A = 2.\nB. Adjacent peaks are 4 ms apart, so T₀ = 0.004 s and f₀ = 1/T₀ = 250 Hz.\nC. The sine wave is zero at t = 0 with positive slope, so θ = 0 rad.\nD. Substitute t − 0.001: the phase is θ − 2πf₀(0.001) = −π/2 rad.",
      solutionFormulas: [
        {
          ariaLabel: "shifted phase equals theta minus two pi f zero times zero point zero zero one, which equals minus pi over two radians",
          mathml:
            "<mrow><mi>θ</mi><mo>−</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mo>(</mo><mn>0.001</mn><mo>)</mo><mo>=</mo><mn>0</mn><mo>−</mo><mn>2</mn><mi>π</mi><mo>(</mo><mn>250</mn><mo>)</mo><mo>(</mo><mn>0.001</mn><mo>)</mo><mo>=</mo><mo>−</mo><mfrac><mi>π</mi><mn>2</mn></mfrac></mrow>",
        },
      ],
      rubric: [
        { label: "Auto-graded final results", points: 12 },
        { label: "Reasoning and intermediate work", points: 12 },
      ],
    },
    {
      id: "ece313-fall-2025-e1-q2",
      title: "2. Fourier Series Properties",
      points: 26,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "The continuous-time Fourier series has several useful properties. In this problem, x(t) has fundamental frequency f₀ and Fourier-series coefficients aₖ. Derive the requested relationship between the coefficients bₖ for y(t) and the stated source coefficients.",
      formulas: [
        {
          ariaLabel: "x of t equals the sum from k equals negative infinity to infinity of a sub k e to the j two pi k f sub zero t",
          mathml:
            "<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><munderover><mo>∑</mo><mrow><mi>k</mi><mo>=</mo><mo>−</mo><mi>∞</mi></mrow><mi>∞</mi></munderover><msub><mi>a</mi><mi>k</mi></msub><msup><mi>e</mi><mrow><mi>j</mi><mn>2</mn><mi>π</mi><mo>(</mo><mi>k</mi><msub><mi>f</mi><mn>0</mn></msub><mo>)</mo><mi>t</mi></mrow></msup></mrow>",
          caption: "Coefficient convention used for all three parts.",
        },
        {
          ariaLabel: "a sub k equals one over T sub zero times the integral from zero to T sub zero of x of t e to the negative j k omega sub zero t d t",
          mathml:
            "<mrow><msub><mi>a</mi><mi>k</mi></msub><mo>=</mo><mfrac><mn>1</mn><msub><mi>T</mi><mn>0</mn></msub></mfrac><msubsup><mo>∫</mo><mn>0</mn><msub><mi>T</mi><mn>0</mn></msub></msubsup><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><msup><mi>e</mi><mrow><mo>−</mo><mi>j</mi><mi>k</mi><msub><mi>ω</mi><mn>0</mn></msub><mi>t</mi></mrow></msup><mi>d</mi><mi>t</mi></mrow>",
        },
      ],
      code: `A. y(t) = x₁(t) + x₂(t), where x₁ has coefficients cₖ and x₂ has coefficients dₖ. Give bₖ.
B. y(t) = e^(−j2πf₀t)x(t). Give bₖ.
C. y(t) = x(t/2). Give bₖ.`,
      answers: ["b_k = c_k + d_k", "b_k = a_{k+1}", "b_k = a_k"],
      answerPoints: [3, 3, 3],
      workRequired: true,
      workPoints: 17,
      workRows: 12,
      workPrompt:
        "Derive each relation from the Fourier-series definition. For part C, include the period change and the substitution used in the coefficient integral.",
      workRubric: [
        { label: "Uses linearity of the Fourier-series integral for part A", points: 5 },
        { label: "Shows the coefficient-index shift caused by modulation in part B", points: 6 },
        { label: "Establishes Tᵧ = 2T₀ and derives the part-C coefficients", points: 6 },
      ],
      officialSolution:
        "A. Linearity gives bₖ = cₖ + dₖ.\nB. Multiplication by e^(−jω₀t) shifts the coefficient index: bₖ = aₖ₊₁.\nC. y(t) = x(t/2) has period Tᵧ = 2T₀, and a change of variables in its coefficient integral gives bₖ = aₖ.",
      solutionFormulas: [
        {
          ariaLabel: "b sub k equals c sub k plus d sub k",
          mathml: "<mrow><msub><mi>b</mi><mi>k</mi></msub><mo>=</mo><msub><mi>c</mi><mi>k</mi></msub><mo>+</mo><msub><mi>d</mi><mi>k</mi></msub></mrow>",
        },
        {
          ariaLabel: "b sub k equals a sub k plus one",
          mathml: "<mrow><msub><mi>b</mi><mi>k</mi></msub><mo>=</mo><msub><mi>a</mi><mrow><mi>k</mi><mo>+</mo><mn>1</mn></mrow></msub></mrow>",
        },
        {
          ariaLabel: "T sub y equals two T sub zero and b sub k equals a sub k",
          mathml: "<mrow><msub><mi>T</mi><mi>y</mi></msub><mo>=</mo><mn>2</mn><msub><mi>T</mi><mn>0</mn></msub><mo>,</mo><mspace width=\"1em\"/><msub><mi>b</mi><mi>k</mi></msub><mo>=</mo><msub><mi>a</mi><mi>k</mi></msub></mrow>",
        },
      ],
      rubric: [
        { label: "Auto-graded coefficient relationships", points: 9 },
        { label: "Derivations", points: 17 },
      ],
    },
    {
      id: "ece313-fall-2025-e1-q3",
      title: "3. Sampling and Aliasing",
      points: 26,
      type: "short",
      gradingMode: "hybrid",
      prompt:
        "A frequency of 46 kHz is above the usual human audible range of 20 Hz to 20 kHz. Sample the following continuous-time cosine at fₛ = 48 kHz.",
      formulas: [
        {
          ariaLabel: "x of t equals cosine of two pi f sub zero t, where f sub zero equals forty six kilohertz and f sub s equals forty eight kilohertz",
          mathml:
            "<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mi mathvariant=\"normal\">cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><msub><mi>f</mi><mn>0</mn></msub><mi>t</mi><mo>)</mo><mo>,</mo><mspace width=\"1em\"/><msub><mi>f</mi><mn>0</mn></msub><mo>=</mo><mn>46</mn><mtext> kHz</mtext><mo>,</mo><mspace width=\"1em\"/><msub><mi>f</mi><mi>s</mi></msub><mo>=</mo><mn>48</mn><mtext> kHz</mtext></mrow>",
        },
      ],
      code: `A. Derive a formula for the discrete-time signal x[n] after sampling.
B. Determine the discrete-time frequency to which f₀ aliases.
C. What continuous-time frequency corresponds to that aliased discrete-time frequency?
D. Is the aliased frequency audible? Answer yes or no.`,
      answers: [
        "cos(2pi(23/24)n) or cos(23pi n/12)",
        "pi/12 rad/sample or -pi/12 rad/sample or 2pi/24 rad/sample",
        "2 kHz or -2 kHz",
        "yes",
      ],
      answerPoints: [3, 4, 4, 2],
      workRequired: true,
      workPoints: 13,
      workRows: 11,
      workPrompt:
        "Show the f₀/fₛ substitution, how the discrete-time frequency wraps into the principal interval, and how you convert the alias back to hertz. Briefly justify the audibility conclusion.",
      workRubric: [
        { label: "Substitutes f₀/fₛ correctly into x[n]", points: 3 },
        { label: "Shows the 2π-periodic aliasing step", points: 4 },
        { label: "Converts the aliased frequency to the valid continuous-time frequency", points: 4 },
        { label: "Relates 2 kHz to the stated audible range", points: 2 },
      ],
      officialSolution:
        "A. x[n] = cos(2π(f₀/fₛ)n) = cos(2π(23/24)n).\nB. Subtracting 2π gives the equivalent alias ±π/12 rad/sample.\nC. The equivalent continuous-time frequency is ±2 kHz; 2 kHz is the positive representative in the reconstruction interval.\nD. Yes. It lies between 20 Hz and 20 kHz.",
      solutionFormulas: [
        {
          ariaLabel: "x of n equals cosine of two pi times twenty three over twenty four n, which aliases to plus or minus pi over twelve radians per sample",
          mathml:
            "<mrow><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant=\"normal\">cos</mi><mo>(</mo><mn>2</mn><mi>π</mi><mfrac><mn>23</mn><mn>24</mn></mfrac><mi>n</mi><mo>)</mo><mo>=</mo><mi mathvariant=\"normal\">cos</mi><mo>(</mo><mfrac><mi>π</mi><mn>12</mn></mfrac><mi>n</mi><mo>)</mo></mrow>",
        },
      ],
      rubric: [
        { label: "Auto-graded final results", points: 13 },
        { label: "Sampling and aliasing derivation", points: 13 },
      ],
    },
    {
      id: "ece313-fall-2025-e1-q4",
      title: "4. Time-Frequency Analysis",
      points: 24,
      type: "short",
      gradingMode: "auto",
      prompt:
        "A complex image signal S[m,k] is obtained by taking the short-time Fourier transform of x[n] using non-overlapping rectangular windows of length N = 5 samples. Identify each plotted STFT component using the four labels below.\n\nSource correction: the official solution identifies two typos in the printed paper. The first and fourth pieces of x(t) are sin² terms, not cos² terms; the recreated waveform and formula below use the corrected, diagram-consistent form.",
      formulas: [
        {
          ariaLabel: "corrected piecewise source signal x of t",
          mathml:
            "<mrow><mi>x</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mo>{</mo><mtable columnalign=\"left left\"><mtr><mtd><msup><mi mathvariant=\"normal\">sin</mi><mn>2</mn></msup><mo>(</mo><mn>2</mn><mi>π</mi><mn>20</mn><mi>t</mi><mo>)</mo></mtd><mtd><mn>0</mn><mo>≤</mo><mi>t</mi><mo>&lt;</mo><mn>0.025</mn></mtd></mtr><mtr><mtd><mi mathvariant=\"normal\">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><mn>80</mn><mi>t</mi><mo>)</mo></mtd><mtd><mn>0.025</mn><mo>≤</mo><mi>t</mi><mo>&lt;</mo><mn>0.05</mn></mtd></mtr><mtr><mtd><mo>−</mo><mi mathvariant=\"normal\">sin</mi><mo>(</mo><mn>2</mn><mi>π</mi><mn>40</mn><mi>t</mi><mo>)</mo></mtd><mtd><mn>0.05</mn><mo>≤</mo><mi>t</mi><mo>&lt;</mo><mn>0.075</mn></mtd></mtr><mtr><mtd><mo>−</mo><msup><mi mathvariant=\"normal\">sin</mi><mn>2</mn></msup><mo>(</mo><mn>2</mn><mi>π</mi><mn>40</mn><mi>t</mi><mo>)</mo></mtd><mtd><mn>0.075</mn><mo>≤</mo><mi>t</mi><mo>≤</mo><mn>0.1</mn></mtd></mtr></mtable></mrow>",
          caption: "Corrected source formula; sampling rate fₛ = 200 Hz.",
        },
        {
          ariaLabel: "S of m k equals STFT of x of n at m k equals the sum from n equals zero to N minus one of x of n w of n minus m e to the negative j two pi k over N n",
          mathml:
            "<mrow><mi>S</mi><mo>[</mo><mi>m</mi><mo>,</mo><mi>k</mi><mo>]</mo><mo>=</mo><mi mathvariant=\"normal\">STFT</mi><mo>{</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>}</mo><mo>[</mo><mi>m</mi><mo>,</mo><mi>k</mi><mo>]</mo><mo>=</mo><munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>0</mn></mrow><mrow><mi>N</mi><mo>−</mo><mn>1</mn></mrow></munderover><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mi>w</mi><mo>[</mo><mi>n</mi><mo>−</mo><mi>m</mi><mo>]</mo><msup><mi>e</mi><mrow><mo>−</mo><mi>j</mi><mn>2</mn><mi>π</mi><mfrac><mi>k</mi><mi>N</mi></mfrac><mi>n</mi></mrow></msup></mrow>",
        },
      ],
      diagrams: [
        {
          kind: "source",
          src: "/exam-assets/ece313/ece313-e1-stft.svg",
          width: 1280,
          height: 1200,
          title: "Source waveform and four STFT component plots",
          alt: "A corrected sampled waveform over time and four five-by-four grayscale STFT heatmaps labeled plots one through four. Each heatmap has frequency rows 80, 40, 0, minus 40, and minus 80 hertz and time columns 0, 0.025, 0.05, and 0.075 seconds.",
          description: "Enter the matching letter for each numbered plot. The visual is manually recreated from the source values, not cropped from the PDF.",
        },
      ],
      code: `Labels: A. Magnitude |S[m,k]|; B. Phase ∠S[m,k]; C. Real part Re{S[m,k]}; D. Imaginary part Im{S[m,k]}.
A. Plot (1)
B. Plot (2)
C. Plot (3)
D. Plot (4)`,
      answers: ["D", "A", "B", "C"],
      answerPoints: [6, 6, 6, 6],
      officialSolution:
        "Plot (1) is the imaginary part because it is zero at 0 Hz for the real-valued source. Plot (2) is magnitude because every value is non-negative. Plot (3) is phase. Plot (4) is the real part, whose 0-Hz row reflects the per-window average.",
      rubric: [
        { label: "Plot (1) identified as imaginary part", points: 6 },
        { label: "Plot (2) identified as magnitude", points: 6 },
        { label: "Plot (3) identified as phase", points: 6 },
        { label: "Plot (4) identified as real part", points: 6 },
      ],
    },
  ],
};
