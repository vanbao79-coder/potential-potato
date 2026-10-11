import { Question, StudentProgress, LessonPlan, Molecule3DData, AISettings, SavedProblem, TextbookAnalysisResult } from '../types/chem';
import { PRESET_QUESTIONS, INITIAL_STUDENTS, INITIAL_MOLECULES } from '../data/chemData';
import { INITIAL_TEXTBOOK_ANALYSIS } from '../data/textbookData';

const STORAGE_KEYS = {
  AI_SETTINGS: 'chemedu_ai_settings',
  QUESTIONS: 'chemedu_questions',
  STUDENTS: 'chemedu_students',
  LESSON_PLAN: 'chemedu_lesson_plan',
  MOLECULES: 'chemedu_molecules',
  SAVED_PROBLEMS: 'chemedu_saved_problems',
  TEXTBOOK_ANALYSES: 'chemedu_textbook_analyses',
};

// --- AI Settings ---
export const getStoredAISettings = (): AISettings => {
  const envKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey || envKey || '',
        model: parsed.model || 'gemini-3-flash-preview',
      };
    }
  } catch (e) {
    console.error('Error reading AI settings from localStorage:', e);
  }
  return {
    apiKey: envKey || '',
    model: 'gemini-3-flash-preview',
  };
};

export const saveStoredAISettings = (settings: AISettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving AI settings to localStorage:', e);
  }
};

// --- Questions ---
export const getStoredQuestions = (): Question[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading questions from localStorage:', e);
  }
  return PRESET_QUESTIONS;
};

export const saveStoredQuestions = (questions: Question[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Error saving questions to localStorage:', e);
  }
};

export const resetStoredQuestions = (): Question[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  } catch (e) {
    console.error('Error resetting questions in localStorage:', e);
  }
  return PRESET_QUESTIONS;
};

// --- Students ---
export const getStoredStudents = (): StudentProgress[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading students from localStorage:', e);
  }
  return INITIAL_STUDENTS;
};

export const saveStoredStudents = (students: StudentProgress[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students to localStorage:', e);
  }
};

export const resetStoredStudents = (): StudentProgress[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  } catch (e) {
    console.error('Error resetting students in localStorage:', e);
  }
  return INITIAL_STUDENTS;
};

// --- Lesson Plan ---
export const getStoredLessonPlan = (): LessonPlan | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSON_PLAN);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading lesson plan from localStorage:', e);
  }
  return null;
};

export const saveStoredLessonPlan = (plan: LessonPlan): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LESSON_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error('Error saving lesson plan to localStorage:', e);
  }
};

// --- Molecules ---
export const getStoredMolecules = (): Molecule3DData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOLECULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading molecules from localStorage:', e);
  }
  return INITIAL_MOLECULES;
};

export const saveStoredMolecules = (molecules: Molecule3DData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MOLECULES, JSON.stringify(molecules));
  } catch (e) {
    console.error('Error saving molecules to localStorage:', e);
  }
};

export const resetStoredMolecules = (): Molecule3DData[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.MOLECULES);
  } catch (e) {
    console.error('Error resetting molecules in localStorage:', e);
  }
  return INITIAL_MOLECULES;
};

// --- Saved Problems ---
export const getStoredProblems = (): SavedProblem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PROBLEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading saved problems from localStorage:', e);
  }
  return [];
};

export const saveStoredProblems = (problems: SavedProblem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_PROBLEMS, JSON.stringify(problems));
  } catch (e) {
    console.error('Error saving problems to localStorage:', e);
  }
};

// --- Textbook Analyses ---
export const getStoredTextbookAnalyses = (): TextbookAnalysisResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEXTBOOK_ANALYSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading textbook analyses from localStorage:', e);
  }
  return [INITIAL_TEXTBOOK_ANALYSIS];
};

export const saveStoredTextbookAnalyses = (analyses: TextbookAnalysisResult[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXTBOOK_ANALYSES, JSON.stringify(analyses));
  } catch (e) {
    console.error('Error saving textbook analyses to localStorage:', e);
  }
};

export const saveSingleTextbookAnalysis = (analysis: TextbookAnalysisResult): TextbookAnalysisResult[] => {
  const current = getStoredTextbookAnalyses();
  const existingIdx = current.findIndex((a) => a.id === analysis.id);
  let updated: TextbookAnalysisResult[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = analysis;
  } else {
    updated = [analysis, ...current];
  }
  saveStoredTextbookAnalyses(updated);
  return updated;
};

export const deleteStoredTextbookAnalysis = (id: string): TextbookAnalysisResult[] => {
  const current = getStoredTextbookAnalyses();
  const updated = current.filter((a) => a.id !== id);
  saveStoredTextbookAnalyses(updated);
  return updated;
};

// --- Generic Exporters ---
export const downloadFile = (filename: string, content: string, contentType: string = 'text/plain') => {
  const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (filename: string, data: any) => {
  downloadFile(filename, JSON.stringify(data, null, 2), 'application/json');
};

export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '');
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  downloadFile(filename, '\uFEFF' + csvContent, 'text/csv');
};
