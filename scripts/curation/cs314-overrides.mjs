// Hand-curated fixes for parsed CS 314 exams, applied by generate-cs-archive.mjs.
//
// Shape, keyed by exam id (e.g. "cs314-2016-fall-exam-2"):
//   subtitle: replace the generated subtitle
//   questions: { [questionNumber]: {
//     replace: { ...full question object, sans id }   // use verbatim, skip parsing
//     set: { field: value, ... }                      // overwrite parsed fields
//     parts: { [label]: "new part text" }             // rewrite one lettered part
//     partAnswers: { [label]: "expected answer" }     // fix one expected answer
//   } }
//
// Diagram transcriptions (trees, graphs, hash tables) are written as prose
// descriptions in the house style ("Tree: root 7; left child 3 with left child
// 4; ...") or as fenced ``` blocks when alignment matters.

export const cs314Overrides = {};
