export interface Problem {
  id: string;
  title: string;
  platform: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  url?: string;
  status: 'Not Started' | 'Practicing' | 'Solved' | 'Mastered';
  attempts: number;
  lastPracticed?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Spaced repetition fields
  nextReviewDate?: string;
  easeFactor: number; // 1.3 to 2.5, determines spacing
  interval: number; // days until next review
  consecutiveCorrect: number;
  consecutiveEasy: number;
  isConquered: boolean;
  reviewHistory: ReviewSession[];
}

export interface ReviewSession {
  problemId: string;
  date: string;
  wasCorrect: boolean;
  difficulty: 'Easy' | 'Hard'; // How difficult was it to solve
  notes?: string;
  timeSpent?: number;
}

export interface DailyRevision {
  date: string;
  problemsReviewed: number;
  correctAnswers: number;
  averageTime?: number;
}