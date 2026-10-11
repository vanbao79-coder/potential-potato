export type CognitiveLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface Question {
  id: string | number;
  level: CognitiveLevel;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  chapter?: string;
}

export interface ExamMatrix {
  recognition: number;
  comprehension: number;
  application: number;
  advancedApplication: number;
}

export interface LessonStage {
  name: string;
  time: string;
  activity: string;
  pedagogicalGoal?: string;
}

export interface LessonPlan {
  title: string;
  competencies: string[];
  stages: LessonStage[];
  digitalMaterials: string[];
}

export interface LogicStep {
  step: number;
  title: string;
  description: string;
  formula?: string;
}

export interface LogicSolution {
  problemSummary: string;
  steps: LogicStep[];
  finalAnswer: string;
  pedagogicalTip: string;
}

export interface Atom3D {
  id: number;
  element: 'C' | 'H' | 'O' | 'N' | 'Cu' | 'Cl' | 'Na' | 'Zn';
  x: number;
  y: number;
  z: number;
  label?: string;
}

export interface Bond3D {
  from: number;
  to: number;
  order: 1 | 2 | 3 | 1.5; // 1.5 for coordination or resonance
}

export interface Molecule3DData {
  id: string;
  name: string;
  iupacName: string;
  formula: string;
  description: string;
  category: 'este' | 'polime' | 'cacbohidrat' | 'phucchat' | 'pin';
  atoms: Atom3D[];
  bonds: Bond3D[];
  microMechanism: string;
  macroObservation: string;
  defaultVariables: {
    temp: number; // °C
    concentration: number; // M
    catalyst: boolean;
  };
}

export interface StudentProgress {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  completionRate: number;
  weakTopics: string[];
  strongTopics: string[];
  lastActive: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  total: number;
  completed: boolean;
  type: 'quiz' | 'lab' | 'theory' | 'challenge';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LivePlayer {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastAnswerIndex: number | null;
  lastAnswerCorrect: boolean | null;
}

export type AIModelName = 'gemini-3-flash-preview' | 'gemini-3-pro-preview' | 'gemini-2.5-flash';

export interface AISettings {
  apiKey: string;
  model: AIModelName;
}

export interface SavedProblem {
  id: string;
  title: string;
  problem: string;
  solution: LogicSolution;
  savedAt: string;
}

export type TextbookSeries = 'Kết nối tri thức' | 'Cánh Diều' | 'Chân trời sáng tạo' | 'Bộ chuẩn GDPT 2018';

export interface TextbookInputData {
  id?: string;
  title: string;
  chapter: string;
  bookSeries: TextbookSeries;
  periods: number;
  rawContent: string;
  imagePreview?: string;
  customFocus?: string;
}

export interface TextbookAnalysisResult {
  id: string;
  analyzedAt: string;
  title: string;
  bookSeries: string;
  chapter: string;
  periods: number;
  usedModel?: string;
  targetCompetencies: {
    chemistryCognition: string[];
    natureExploration: string[];
    practicalApplication: string[];
    qualities: string[];
  };
  coreKnowledge: {
    keyDefinitions: { term: string; definition: string }[];
    iupacNomenclature: { term: string; formula: string; rules: string }[];
    reactionEquations: { name: string; equation: string; condition?: string; mechanism: string }[];
    microMacroLink: { micro: string; macro: string; significance: string }[];
  };
  misconceptions: {
    misconception: string;
    scientificFact: string;
    pedagogicalRemedy: string;
  }[];
  digitalLabRecommendations: {
    experimentTitle: string;
    safetyNotes: string;
    observation: string;
    relatedMoleculeId?: string;
    simulationHint: string;
  }[];
  lessonPlan5512: LessonPlan;
  assessmentQuestions: Question[];
  summaryMarkdown: string;
}

