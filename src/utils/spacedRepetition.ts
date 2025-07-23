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

  // Consecutive easy solves needed to mark as conquered (8-10 range)
  private static readonly CONQUERED_THRESHOLD = 8;

  // Multipliers for different performance levels
  private static readonly PERFORMANCE_MULTIPLIERS = {
    EASY_SOLVE: 1.4,
    HARD_SOLVE: 0.7,
    FAILED_SOLVE: 0.5
  };

  // Conquest maintenance - percentage of conquered problems to randomly review
  private static readonly CONQUEST_REVIEW_RATE = 0.05; // 5% weekly

  static initializeProblem(problem: Omit<Problem, 'easeFactor' | 'interval' | 'consecutiveCorrect' | 'consecutiveEasy' | 'isConquered' | 'reviewHistory' | 'nextReviewDate'>): Problem {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      ...problem,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      interval: 1,
      consecutiveCorrect: 0,
      consecutiveEasy: 0,
      isConquered: false,
      reviewHistory: [],
      nextReviewDate: tomorrow.toISOString().split('T')[0]
    };
  }

  static updateAfterReview(problem: Problem, wasCorrect: boolean, solveDifficulty: 'Easy' | 'Hard', notes?: string): Problem {
    const today = new Date().toISOString().split('T')[0];
    
    // Add to review history
    const newReviewSession: ReviewSession = {
      problemId: problem.id,
      date: today,
      wasCorrect,
      difficulty: solveDifficulty,
      notes
    };

    let newEaseFactor = problem.easeFactor;
    let newInterval = problem.interval;
    let newConsecutiveCorrect = problem.consecutiveCorrect;
    let newConsecutiveEasy = problem.consecutiveEasy;

    if (wasCorrect) {
      newConsecutiveCorrect += 1;
      
      if (solveDifficulty === 'Easy') {
        newConsecutiveEasy += 1;
        // Increase ease factor for easy solves, more aggressive for early solves
        const easeIncrease = newConsecutiveEasy <= 3 ? 0.1 : 0.15;
        newEaseFactor = Math.min(this.MAX_EASE_FACTOR, newEaseFactor + easeIncrease);
      } else {
        // Reset consecutive easy count if solved with difficulty
        newConsecutiveEasy = 0;
        // Slightly decrease ease factor for hard solves
        newEaseFactor = Math.max(this.MIN_EASE_FACTOR, newEaseFactor - 0.08);
      }

      // Calculate new interval based on ease factor
      if (newConsecutiveCorrect === 1) {
        newInterval = solveDifficulty === 'Easy' ? 1 : 1; // Both tomorrow for first solve
      } else if (newConsecutiveCorrect === 2) {
        newInterval = solveDifficulty === 'Easy' ? 3 : 2; // Easy: 3 days, Hard: 2 days
      } else {
        const multiplier = solveDifficulty === 'Easy' ? this.PERFORMANCE_MULTIPLIERS.EASY_SOLVE : this.PERFORMANCE_MULTIPLIERS.HARD_SOLVE;
        // Progressive spacing - smaller gaps initially, larger gaps later
        const progressiveMultiplier = newConsecutiveEasy <= 4 ? 0.8 : 1.2;
        newInterval = Math.round(newInterval * newEaseFactor * multiplier * progressiveMultiplier);
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
      // If conquered, schedule for much later review (60 days)
      nextReviewDate.setDate(nextReviewDate.getDate() + 60);
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
    
    let dueProblems = problems.filter(problem => {
      // Skip conquered problems unless it's been a very long time
      if (problem.isConquered) {
        return false;
      }
      
      // Include problems that are due for review today or overdue
      return problem.nextReviewDate && problem.nextReviewDate <= today;
    });

    // Add random conquered problems for maintenance (5% chance per conquered problem)
    const conqueredProblems = problems.filter(p => p.isConquered);
    const randomConqueredCount = Math.floor(conqueredProblems.length * this.CONQUEST_REVIEW_RATE);
    
    if (randomConqueredCount > 0) {
      const shuffled = [...conqueredProblems].sort(() => 0.5 - Math.random());
      const selectedConquered = shuffled.slice(0, randomConqueredCount);
      dueProblems = [...dueProblems, ...selectedConquered];
    }

    // Sort by priority: overdue problems first, then by difficulty (harder first for better learning)
    return dueProblems.sort((a, b) => {
      const aOverdue = a.nextReviewDate && a.nextReviewDate < today;
      const bOverdue = b.nextReviewDate && b.nextReviewDate < today;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Prioritize pending/overdue problems
      const aDaysSinceScheduled = a.nextReviewDate ? 
        Math.floor((new Date(today).getTime() - new Date(a.nextReviewDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const bDaysSinceScheduled = b.nextReviewDate ? 
        Math.floor((new Date(today).getTime() - new Date(b.nextReviewDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (aDaysSinceScheduled !== bDaysSinceScheduled) {
        return bDaysSinceScheduled - aDaysSinceScheduled;
      }
      
      // If both overdue or both due today, prioritize by consecutive failures
      const aFailures = a.reviewHistory.filter(r => !r.wasCorrect).length;
      const bFailures = b.reviewHistory.filter(r => !r.wasCorrect).length;
      
      if (aFailures !== bFailures) return bFailures - aFailures;
      
      // Finally, sort by difficulty (Hard > Medium > Easy)
      const difficultyOrder = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
      return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
    });
  }

  static getPendingInfo(problem: Problem): { isPending: boolean; daysPending: number; scheduledDate: string } {
    const today = new Date().toISOString().split('T')[0];
    const scheduledDate = problem.nextReviewDate || '';
    
    if (!scheduledDate || scheduledDate > today) {
      return { isPending: false, daysPending: 0, scheduledDate };
    }
    
    const daysPending = Math.floor(
      (new Date(today).getTime() - new Date(scheduledDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return { 
      isPending: daysPending > 0, 
      daysPending, 
      scheduledDate 
    };
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