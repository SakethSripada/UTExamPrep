import type { Choice, Exam, Question } from "@/app/lib/exam-types";

const sourcePath =
  "exampdfs/ch301-ch302/undated/practice-exam-with-answers-ch301-practice-questions.pdf";

function short(number: number, prompt: string, answer: string): Question {
  return {
    id: `ch301-practice-q${number}`,
    title: `${number}. Question`,
    points: 1,
    type: "short",
    gradingMode: "auto",
    prompt,
    answers: [answer],
    officialSolution: answer,
    sourceNote: `${sourcePath}, question ${number}`,
  };
}

function choice(
  number: number,
  prompt: string,
  choices: Choice[],
  correctChoiceIds: string[],
  allowMultiple = false,
): Question {
  return {
    id: `ch301-practice-q${number}`,
    title: `${number}. Question`,
    points: 1,
    type: "choice",
    gradingMode: "auto",
    prompt,
    choices,
    correctChoiceIds,
    allowMultiple,
    officialSolution: `Correct answer${correctChoiceIds.length === 1 ? "" : "s"}: ${correctChoiceIds.join(", ")}`,
    sourceNote: `${sourcePath}, question ${number}`,
  };
}

export const ch301Practice: Exam = {
  id: "ch301-practice",
  title: "CH 301 Practice Questions",
  subtitle: "Atomic structure, gases, bonding, thermodynamics, and intermolecular forces",
  course: "CH 301",
  subject: "Chemistry",
  term: "Practice",
  examType: "Practice Questions",
  sourceFiles: [
    {
      label: "Official UT Testing practice questions and answers",
      path: sourcePath,
      url: "https://testingservices.utexas.edu/sites/default/files/CH301-Practice-Questions.pdf",
      role: "exam",
    },
  ],
  questions: [
    short(
      1,
      "A radio station broadcasts at a frequency of 105 MHz. What is the energy of one photon at this frequency?",
      "6.96 × 10^-26 J",
    ),
    short(2, "How many d electrons does iodine (atomic number 53) possess?", "20"),
    short(3, "The 3d sublevel has enhanced stability when it contains how many electrons?", "5 or 10"),
    choice(
      4,
      "Which set of quantum numbers is possible for an electron in a 3d orbital?",
      [
        { id: "1", text: "n = 3; ℓ = 2; mℓ = 0" },
        { id: "2", text: "n = 3; ℓ = 1; mℓ = −1" },
        { id: "3", text: "n = 3; ℓ = 2; mℓ = −3" },
        { id: "4", text: "n = 3; ℓ = 0; mℓ = 0" },
        { id: "5", text: "n = 2; ℓ = 2; mℓ = 2" },
        { id: "6", text: "n = 2; ℓ = 3; mℓ = 0" },
        { id: "7", text: "n = 3; ℓ = 3; mℓ = 1" },
      ],
      ["1"],
    ),
    short(
      5,
      "Vapor from 0.495 g of an unknown liquid is collected in a 127 mL flask. At 371 K, its pressure is 754 torr. What is the liquid’s molar mass?",
      "1.20 × 10^2 g/mol",
    ),
    short(6, "What is the density of nitrogen gas at STP?", "1.25 g/L"),
    short(
      7,
      "Two equal-volume containers hold H₂ and O₂ at the same temperature and pressure. Is the average molecular speed of O₂ equal to, greater than, or less than that of H₂?",
      "less than",
    ),
    choice(
      8,
      "Select every true statement.",
      [
        { id: "I", text: "Real gases behave more like ideal gases as temperature increases." },
        { id: "II", text: "At constant n and T, decreasing pressure decreases volume." },
        { id: "III", text: "At 1 atm and 273 K, every molecule in a gas sample has the same speed." },
        { id: "IV", text: "At the same temperature, CO₂ at 1 atm and H₂ at 5 atm have the same average kinetic energy." },
      ],
      ["I", "IV"],
      true,
    ),
    short(9, "How many sigma (σ) and pi (π) bonds are present in CH₃CH₂CH=CHCH₃?", "14 sigma, 1 pi"),
    short(10, "How many lone pairs are present in the Lewis structure of IO₃⁻?", "10"),
    short(11, "What is the molecular geometry of SF₅?", "square pyramidal"),
    short(12, "What is the hybridization of the central atom in XeF₄?", "sp3d2"),
    short(13, "PBr₃ is a polar or nonpolar molecule with polar or nonpolar bonds? Give both answers in that order.", "polar; polar"),
    short(14, "What is the bond order of C₂?", "2"),
    short(
      15,
      "Estimate ΔH for the gas-phase reaction NCl₃ + 3 H₂O → NH₃ + 3 HOCl using these bond energies: N–Cl = 190 kJ/mol, O–H = 464 kJ/mol, N–H = 391 kJ/mol, and O–Cl = 206 kJ/mol.",
      "+171 kJ/mol rxn",
    ),
    short(
      16,
      "Calculate ΔH for SO₂(g) + ½ O₂(g) → SO₃(g), given ΔH = +296.8 kJ/mol for SO₂(g) → S(s) + O₂(g), and ΔH = +791.4 kJ for 2 SO₃(g) → 2 S(s) + 3 O₂(g).",
      "-98.9 kJ/mol rxn",
    ),
    short(17, "Which physical state—solid, liquid, or gas—has the lowest entropy?", "solid"),
    short(
      18,
      "Calculate ΔS for N₂(g) + 3 H₂(g) → 2 NH₃(g) at 298 K and 1 atm. The standard molar entropies are 191.5 J/(mol·K) for N₂, 130.6 J/(mol·K) for H₂, and 192.3 J/(mol·K) for NH₃.",
      "-198.7 J/mol K",
    ),
    short(
      19,
      "What is the molarity of an HCl solution if 2.50 L is required to react completely with 12.7 g Al according to 2 Al + 6 HCl → 2 AlCl₃ + 3 H₂?",
      "0.564 M",
    ),
    choice(
      20,
      "For 2 SO₂(g) + O₂(g) → 2 SO₃(g), ΔH = −10.0 kJ per mole of reaction. Which statement correctly predicts spontaneity?",
      [
        { id: "A", text: "The reaction is spontaneous at all temperatures." },
        { id: "B", text: "The reaction is spontaneous only at low temperatures." },
        { id: "C", text: "The reaction is spontaneous only at high temperatures." },
        { id: "D", text: "The reaction is not spontaneous at any temperature." },
        { id: "E", text: "The information given is insufficient to predict spontaneity." },
      ],
      ["B"],
    ),
    choice(
      21,
      "Which element has the largest atomic radius?",
      [
        { id: "A", text: "Ca" },
        { id: "B", text: "K" },
        { id: "C", text: "Rb" },
        { id: "D", text: "Sr" },
      ],
      ["C"],
    ),
    short(22, "What intermolecular force is expected between H₂S molecules in a liquid sample?", "dipole-dipole forces"),
    short(23, "Order C₂H₆, H₂S, H₂O, and NaI from lowest to highest melting point.", "C2H6, H2S, H2O, NaI"),
  ],
};
