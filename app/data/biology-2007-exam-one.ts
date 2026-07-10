import type { Exam, Question } from "@/app/lib/exam-types";

const sourcePath = "exampdfs/bio311c-bio311d/2010/exam-1-solution-2007-exam-1.pdf";

const multipleChoice: Array<[string, string[], string]> = [
  ["A chemical species carrying one or more negative electrical charges is called a(n):", ["anion", "cation", "isotope", "isomer"], "A"],
  ["A single unit of an element is called a(n):", ["proton", "ion", "molecule", "atom"], "D"],
  ["A chemical reaction involves the loss, gain, or redistribution of one or more:", ["atoms", "molecules", "protons", "electrons"], "D"],
  ["How many covalent bonds occur in CH₄?", ["2", "3", "4", "5"], "C"],
  ["Which compound is organic?", ["H₂O", "CH₃OH", "HCO₃⁻", "NH₃"], "B"],
  ["Which functional group appears in the displayed molecule?", ["Alcohol", "Aldehyde", "Ketone", "Carboxylic acid"], "D"],
  ["A typical covalent bond length is approximately:", ["1 Å", "3 Å", "40 Å", "109 Å"], "A"],
  ["Which structure is most important for movement of human cells by lamellipodia?", ["Microtubules", "Microfilaments", "Intermediate filaments", "Pili"], "B"],
  ["Collagen fibers, proteoglycans, and fibronectin are components of an animal cell’s:", ["glycocalyx", "centrosome", "lysosome", "flagellum"], "A"],
  ["The black-box properties of living cells considered in this course are:", ["unique to individual cells", "also properties of isolated membrane-bounded organelles", "still expressed after a cell dies if its components remain together", "also properties of entire stable ecosystems"], "D"],
  ["Experiments by Robert Hooke, Antonie van Leeuwenhoek, and Louis Pasteur led directly to the modern concept of:", ["the cell doctrine", "the central dogma of molecular biology", "the black-box properties of living cells", "the five-kingdom classification"], "A"],
  ["The outer boundary of the living substance of a cell is the:", ["cell wall", "plasma membrane", "sheath or capsule", "glycocalyx"], "B"],
  ["The water-insoluble organic molecules of cells are called:", ["carbohydrates", "lipids", "nucleic acids", "proteins"], "B"],
  ["A process in which two hydrogen atoms are lost from a reduced organic molecule is a(n):", ["isomerization", "ionization", "reduction", "oxidation"], "D"],
  ["Which length is shortest?", ["1,000 Å", "10 nm", "0.1 μm", "0.001 mm"], "B"],
  ["Spherical living cells generally are not larger than 100 μm in diameter. Which change would not allow a cell to become larger?", ["Make the plasma membrane highly irregular", "Place a large vacuole inside the cell", "Become long and thin without changing the surface-area-to-volume ratio", "Decrease the metabolic rate"], "C"],
  ["How many of the five recognized kingdoms of living organisms are prokaryotic?", ["1", "2", "3", "4"], "A"],
  ["Which structure is not surrounded by a double-membrane envelope?", ["Lysosome", "Proplastid", "Prokaryotic cell", "Nucleus"], "A"],
  ["Which culture is expected to contain rod-shaped bacteria?", ["Staphylococcus aureus", "Diplococcus pneumoniae", "Streptobacillus moniliformis", "Spirillum pleomorphum"], "C"],
  ["Quorum sensing is an example of bacterial:", ["differentiation into two cell types", "communication among cells", "plasmid production in response to environmental extremes", "capsule production after engulfment by a phagocytic cell"], "B"],
  ["The intermembrane (periplasmic) space of a prokaryotic cell is:", ["between its envelope and an external sheath", "inside a bacterial flagellum", "its cytoplasm", "between its plasma membrane and outer membrane"], "D"],
  ["Which feature is more likely in a prokaryote that performs respiration or photosynthesis than in one that performs neither?", ["Plasmids", "Many pili", "Internal membranes", "Occlusions"], "C"],
  ["Most prokaryotic cells have diameters:", ["1–5 nm", "50–200 nm", "0.5–5 μm", "5–100 μm"], "C"],
  ["Which structure is not membrane-bounded?", ["Peroxisome", "80S ribosome", "Food vacuole", "Smooth endoplasmic reticulum"], "B"],
  ["Which structure is not part of the endomembrane system?", ["Mitochondrion", "Nuclear envelope", "Plasma membrane", "Golgi body"], "A"],
  ["Which structure is continuous with the outer nuclear membrane?", ["Golgi cisternae", "Lamins", "Rough endoplasmic reticulum", "Peroxisomes"], "C"],
  ["The primary function of mitochondria is:", ["respiration", "starch synthesis", "detoxification of benzene rings", "intracellular digestion"], "A"],
  ["Toxic H₂O₂ is destroyed in eukaryotic cells primarily within:", ["lysosomes", "mitochondria", "the nucleoplasm", "peroxisomes"], "D"],
  ["Bacteria engulfed by animal cells are digested within:", ["mitochondria", "lysosomes", "smooth endoplasmic reticulum", "plastids"], "B"],
  ["A spherical eukaryotic organelle surrounded by one membrane and performing few metabolic functions is a:", ["vacuole", "cisterna", "crista", "thylakoid"], "A"],
  ["Some ribosomes bind to rough endoplasmic reticulum in order to:", ["move to Golgi bodies", "insert proteins into the ER lumen", "separate their subunits", "convert from 80S to 70S"], "B"],
  ["Packing luminal proteins and sorting compounds for their final destinations occur within the:", ["Golgi apparatus", "lysosomes", "inner nuclear membrane", "rough endoplasmic reticulum"], "A"],
  ["Which statement about cilia is false?", ["They contain microtubules", "They contain microfilaments", "They contain motor proteins", "They are surrounded by plasma membrane"], "B"],
  ["Muscle movement in animals and cytoplasmic streaming in plant cells depend on:", ["actin filaments", "β-tubulin", "keratin and lamins", "chromatin fibrils"], "A"],
  ["The diameter of a microtubule is approximately:", ["2.5 Å", "25 nm", "2.5 μm", "25 μm"], "B"],
  ["Which structure is virtually identical to a eukaryotic basal body?", ["Flagellum", "Cilium", "Spindle apparatus", "Centriole"], "D"],
  ["According to endosymbiont theory, which organelle first appeared in eukaryotes through uptake of a prokaryotic cell?", ["Lysosome", "Golgi body", "Mitochondrion", "Central vacuole"], "C"],
];

const questions: Question[] = multipleChoice.map(([prompt, optionText, correct], index) => {
  const number = index + 1;
  return {
    id: `bio311c-2007-e1-q${number}`,
    title: `${number}. Multiple Choice`,
    points: 1,
    type: "choice",
    gradingMode: "auto",
    prompt,
    choices: optionText.map((text, choiceIndex) => ({ id: String.fromCharCode(65 + choiceIndex), text })),
    correctChoiceIds: [correct],
    officialSolution: `Official key: ${correct}`,
    sourceNote: `${sourcePath}, question ${number}`,
    ...(number === 6
      ? {
          image: "/exam-assets/biology/acetic-acid-structure.svg",
          imageAlt: "Structural formula of acetic acid: CH₃ bonded to a carboxylic acid group.",
          imageWidth: 420,
          imageHeight: 180,
        }
      : {}),
  };
});

questions.push(
  {
    id: "bio311c-2007-e1-q38",
    title: "38. Eukaryotic Cell Components",
    points: 3,
    type: "short",
    gradingMode: "auto",
    prompt: "List the three distinct components into which a eukaryotic cell may be divided, as described in BIO 311C.",
    code: "A. First component\nB. Second component\nC. Third component",
    answers: ["Plasma membrane", "Cytoplasm", "Nucleus"],
    answerPoints: [1, 1, 1],
    officialSolution: "A. Plasma membrane\nB. Cytoplasm\nC. Nucleus",
    sourceNote: `${sourcePath}, question 38`,
  },
  {
    id: "bio311c-2007-e1-q39",
    title: "39. Atom Properties",
    points: 15,
    type: "short",
    gradingMode: "auto",
    prompt: "Complete the missing entries from the atom-properties table.",
    code: `A. Hydrogen: chemical symbol
B. Hydrogen: covalency
C. Hydrogen: electronegative (yes or no)
D. Oxygen: chemical symbol
E. Oxygen: electronegative (yes or no)
F. Carbon: atom name
G. Carbon: covalency
H. Carbon: electronegative (yes or no)
I. Nitrogen: atom name
J. Nitrogen: covalency
K. Phosphorus: atom name
L. Phosphorus: covalency
M. Phosphorus: electronegative (yes or no)
N. Sulfur: atom name
O. Sulfur: covalency`,
    answers: ["H", "1", "No", "O", "Yes", "Carbon", "4", "No", "Nitrogen", "3", "Phosphorus", "5", "No", "Sulfur", "2"],
    answerPoints: Array(15).fill(1),
    officialSolution: "H; 1; No; O; Yes; Carbon; 4; No; Nitrogen; 3; Phosphorus; 5; No; Sulfur; 2",
    sourceNote: `${sourcePath}, question 39`,
  },
  {
    id: "bio311c-2007-e1-q40",
    title: "40. Prokaryotic and Eukaryotic Cells",
    points: 9,
    type: "short",
    gradingMode: "auto",
    prompt: "Classify each statement using the reference categories.",
    reference: `A. Not true of either prokaryotic or eukaryotic cells
B. True of virtually all prokaryotic cells, but not generally of eukaryotic cells
C. True of virtually all eukaryotic cells, but not generally of prokaryotic cells
D. Generally true of both prokaryotic and eukaryotic cells`,
    code: `A. Contains a plasma membrane
B. Contains occlusions
C. Contains 80S ribosomes
D. Contains 70S ribosomes
E. Contains intermediate filaments
F. Contains plasmids
G. Contents are maintained at equilibrium
H. The surrounding envelope includes two membranes
I. Contains chromatin with histone proteins`,
    answers: ["D", "D", "C", "D", "C", "B", "A", "B", "C"],
    answerPoints: Array(9).fill(1),
    officialSolution: "D, D, C, D, C, B, A, B, C",
    sourceNote: `${sourcePath}, question 40`,
  },
  {
    id: "bio311c-2007-e1-q41",
    title: "41. Animal and Plant Cells",
    points: 6,
    type: "short",
    gradingMode: "auto",
    prompt: "Classify each statement using the reference categories.",
    reference: `A. True of virtually all animal cells, but not generally of plant cells
B. True of virtually all plant cells, but not generally of animal cells
C. Generally true of both plant and animal cells`,
    code: `A. Contains Golgi bodies
B. Contains centrioles
C. Contains mitochondria
D. Contains proplastids
E. Contains a central vacuole
F. Contains plasmodesmata`,
    answers: ["C", "A", "C", "B", "B", "B"],
    answerPoints: Array(6).fill(1),
    officialSolution: "C, A, C, B, B, B",
    sourceNote: `${sourcePath}, question 41`,
  },
);

export const bio311c2007ExamOne: Exam = {
  id: "bio311c-2007-exam-1",
  title: "BIO 311C Spring 2007 Exam 1",
  subtitle: "Cell chemistry, cell structure, prokaryotes, and organelles",
  course: "BIO 311C",
  subject: "Biology",
  term: "Spring 2007",
  examType: "Exam 1",
  sourceFiles: [{ label: "Official keyed exam PDF", path: sourcePath, role: "solution" }],
  questions,
};
