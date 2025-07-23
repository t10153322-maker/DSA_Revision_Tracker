import { Problem, ReviewSession } from '../types';

export class SpacedRepetitionSystem {
  // Initial intervals for new problems (in days)
  private static readonly INITIAL_INTERVALS = {
    Easy: 4,
    Medium: 3,
    Hard: 2
  };

  // Minimum and maximum ease factors
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly MAX_EASE_FACTOR = 2.5;
  private static readonly DEFAULT_EASE_FACTOR = 2.5;

  // Consecutive easy solves needed to mark as conquered
  private static readonly CONQUERED_THRESHOLD = 5;

  static initializeProblem(problem: Omit<Problem, 'easeFactor' | 'interval' | 'consecutiveCorrect' | 'consecutiveEasy' | 'isConquered' | 'reviewHistory' | 'nextReviewDate'>): Problem {
    const today = new Date();
    const nextReviewDate = new Date(today);
    nextReviewDate.setDate(today.getDate() + this.INITIAL_INTERVALS[problem.difficulty]);

    return {
      ...problem,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      interval: this.INITIAL_INTERVALS[problem.difficulty],
      consecutiveCorrect: 0,
      consecutiveEasy: 0,
      isConquered: false,
      reviewHistory: [],
      nextReviewDate: nextReviewDate.toISOString().split('T')[0]
    };
  }

  static updateAfterReview(problem: Problem, wasCorrect: boolean, solveDifficulty: 'Easy' | 'Hard'): Problem {
    const today = new Date().toISOString().split('T')[0];
    
    // Add to review history
    const newReviewSession: ReviewSession = {
      problemId: problem.id,
      date: today,
      wasCorrect,
      difficulty: solveDifficulty
    };

    let newEaseFactor = problem.easeFactor;
    let newInterval = problem.interval;
    let newConsecutiveCorrect = problem.consecutiveCorrect;
    let newConsecutiveEasy = problem.consecutiveEasy;

    if (wasCorrect) {
      newConsecutiveCorrect += 1;
      
      if (solveDifficulty === 'Easy') {
        newConsecutiveEasy += 1;
        // Increase ease factor for easy solves
        newEaseFactor = Math.min(this.MAX_EASE_FACTOR, newEaseFactor + 0.1);
      } else {
        // Reset consecutive easy count if solved with difficulty
        newConsecutiveEasy = 0;
        // Slightly decrease ease factor for hard solves
        newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor - 0.05);
      }

      // Calculate new interval based on ease factor
      if (newConsecutiveCorrect === 1) {
        newInterval = 1; // Review tomorrow
      } else if (newConsecutiveCorrect === 2) {
        newInterval = 3; // Review in 3 days
      } else {
        newInterval = Math.round(newInterval * newEaseFactor);
      }
    } else {
      // Reset on incorrect answer
      newConsecutiveCorrect = 0;
      newConsecutiveEasy = 0;
      newInterval = 1; // Review tomorrow
      newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor - 0.2);
    }

    // Check if problem is conquered
    const isConquered = newConsecutiveEasy >= this.CONQUERED_THRESHOLD;

    // Calculate next review date
    const nextReviewDate = new Date();
    if (isConquered) {
      // If conquered, schedule for much later review (30 days)
      nextReviewDate.setDate(nextReviewDate.getDate() + 30);
    } else {
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    }

    return {
      ...problem,
      easeFactor: newEaseFactor,
      interval: newInterval,
      consecutiveCorrect: newConsecutiveCorrect,
      consecutiveEasy: newConsecutiveEasy,
      isConquered,
      reviewHistory: [...problem.reviewHistory, newReviewSession],
      nextReviewDate: nextReviewDate.toISOString().split('T')[0],
      lastPracticed: today,
      attempts: problem.attempts + 1,
      updatedAt: new Date().toISOString()
    };
  }

  static getProblemsForToday(problems: Problem[]): Problem[] {
    const today = new Date().toISOString().split('T')[0];
    
    return problems.filter(problem => {
      // Skip conquered problems unless it's been a very long time
      if (problem.isConquered) {
        return false;
      }
      
      // Include problems that are due for review today or overdue
      return problem.nextReviewDate && problem.nextReviewDate <= today;
    });
  }

  static getConqueredProblems(problems: Problem[]): Problem[] {
    return problems.filter(problem => problem.isConquered);
  }

  static getUpcomingReviews(problems: Problem[], days: number = 7): Problem[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    return problems.filter(problem => {
      if (problem.isConquered || !problem.nextReviewDate) return false;
      return problem.nextReviewDate > todayStr && problem.nextReviewDate <= futureDateStr;
    }).sort((a, b) => (a.nextReviewDate || '').localeCompare(b.nextReviewDate || ''));
  }
}