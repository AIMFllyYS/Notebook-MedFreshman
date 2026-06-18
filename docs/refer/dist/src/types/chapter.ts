export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  sections: Section[];
  examWeight: number;
  difficulty: number;
  estimatedHours: number;
  color: string;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  keyPoints: string[];
  isImportant: boolean;
  isHard: boolean;
}

export interface KnowledgePoint {
  id: string;
  chapterId: number;
  sectionId: string;
  title: string;
  definition: string;
  intuition: string;
  formulas: Formula[];
  prerequisites: string[];
  tags: ('core' | 'important' | 'tricky' | 'exam-frequent')[];
}

export interface Formula {
  id: string;
  name: string;
  latex: string;
  description: string;
}
