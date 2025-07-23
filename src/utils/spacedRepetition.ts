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

  // Multipliers for different performance levels
  private static readonly PERFORMANCE_MULTIPLIERS = {
    EASY_SOLVE: 1.3,
    HARD_SOLVE: 0.8,
    FAILED_SOLVE: 0.5
  };

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
        newEaseFactor = Math.min(this.MAX_EASE_FACTOR, newEaseFactor + 0.15);
      } else {
        // Reset consecutive easy count if solved with difficulty
        newConsecutiveEasy = 0;
        // Slightly decrease ease factor for hard solves
        newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor - 0.08);
      }

      // Calculate new interval based on ease factor
      if (newConsecutiveCorrect === 1) {
        newInterval = solveDifficulty === 'Easy' ? 2 : 1; // Easy: day after tomorrow, Hard: tomorrow
      } else if (newConsecutiveCorrect === 2) {
        newInterval = solveDifficulty === 'Easy' ? 4 : 3; // Easy: 4 days, Hard: 3 days
      } else {
        const multiplier = solveDifficulty === 'Easy' ? this.PERFORMANCE_MULTIPLIERS.EASY_SOLVE : this.PERFORMANCE_MULTIPLIERS.HARD_SOLVE;
        newInterval = Math.round(newInterval * newEaseFactor * multiplier);
      }
    } else {
      // Reset on incorrect answer
      newConsecutiveCorrect = 0;
      newConsecutiveEasy = 0;
      newInterval = 1; // Review tomorrow for failed attempts
      newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor - 0.25);
    }

    // Check if problem is conquered
    const isConquered = newConsecutiveEasy >= this.CONQUERED_THRESHOLD;

    // Calculate next review date
    const nextReviewDate = new Date();
    if (isConquered) {
      // If conquered, schedule for much later review (45 days)
      nextReviewDate.setDate(nextReviewDate.getDate() + 45);
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
    
    const dueProblems = problems.filter(problem => {
      // Skip conquered problems unless it's been a very long time
      if (problem.isConquered) {
        return false;
      }
      
      // Include problems that are due for review today or overdue
      return problem.nextReviewDate && problem.nextReviewDate <= today;
    });

    // Sort by priority: overdue problems first, then by difficulty (harder first for better learning)
    return dueProblems.sort((a, b) => {
      const aOverdue = a.nextReviewDate && a.nextReviewDate < today;
      const bOverdue = b.nextReviewDate && b.nextReviewDate < today;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // If both overdue or both due today, prioritize by consecutive failures
      const aFailures = a.reviewHistory.filter(r => !r.wasCorrect).length;
      const bFailures = b.reviewHistory.filter(r => !r.wasCorrect).length;
      
      if (aFailures !== bFailures) return bFailures - aFailures;
      
      // Finally, sort by difficulty (Hard > Medium > Easy)
      const difficultyOrder = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
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

  static getWeakTopics(problems: Problem[]): { topic: string; failureRate: number; problemCount: number }[] {
    const topicStats = problems.reduce((acc, problem) => {
      if (!acc[problem.topic]) {
        acc[problem.topic] = { total: 0, failures: 0 };
      }
      acc[problem.topic].total++;
      
      const recentFailures = problem.reviewHistory
        .slice(-5) // Last 5 attempts
        .filter(r => !r.wasCorrect).length;
      
      acc[problem.topic].failures += recentFailures;
      return acc;
    }, {} as Record<string, { total: number; failures: number }>);

    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        failureRate: stats.total > 0 ? (stats.failures / (stats.total * 5)) * 100 : 0,
        problemCount: stats.total
      }))
      .filter(item => item.problemCount >= 3) // Only topics with at least 3 problems
      .sort((a, b) => b.failureRate - a.failureRate)
      .slice(0, 5); // Top 5 weak topics
  }
}