export interface Exercise {
  id: string;
  chapterId: number;
  sectionId: string;
  difficulty: 'basic' | 'intermediate' | 'challenge' | 'exam';
  type: 'choice' | 'fill' | 'proof' | 'calculation';
  tags: string[];
  question: string;
  options?: string[];
  answer: string;
  solution: string;
  hints: string[];
  relatedFormulas: string[];
  commonMistakes: string[];
}

export interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  userAnswer: string;
  timestamp: number;
  timeSpent: number;
}

export interface ExerciseProgress {
  chapterId: number;
  total: number;
  completed: number;
  correct: number;
  results: ExerciseResult[];
}
