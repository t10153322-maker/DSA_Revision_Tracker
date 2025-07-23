import React, { useState, useEffect } from 'react';
import { Problem, ReviewSession } from '../types';
import { SpacedRepetitionSystem } from '../utils/spacedRepetition';
import { Clock, CheckCircle, XCircle, ExternalLink, Brain, Target } from 'lucide-react';

interface RevisionPageProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
}

const RevisionPage: React.FC<RevisionPageProps> = ({ problems, onUpdateProblem }) => {
  const [todayProblems, setTodayProblems] = useState<Problem[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    completed: 0,
    correct: 0,
    startTime: Date.now()
  });

  useEffect(() => {
    const problemsForToday = SpacedRepetitionSystem.getProblemsForToday(problems);
    setTodayProblems(problemsForToday);
    setCurrentProblemIndex(0);
    setShowResult(false);
  }, [problems]);

  const currentProblem = todayProblems[currentProblemIndex];

  const handleReview = (wasCorrect: boolean, difficulty: 'Easy' | 'Hard') => {
    if (!currentProblem) return;

    const updatedProblem = SpacedRepetitionSystem.updateAfterReview(
      currentProblem,
      wasCorrect,
      difficulty
    );

    onUpdateProblem(currentProblem.id, updatedProblem);

    setSessionStats(prev => ({
      ...prev,
      completed: prev.completed + 1,
      correct: prev.correct + (wasCorrect ? 1 : 0)
    }));

    setShowResult(true);

    // Auto-advance to next problem after 2 seconds
    setTimeout(() => {
      if (currentProblemIndex < todayProblems.length - 1) {
        setCurrentProblemIndex(prev => prev + 1);
        setShowResult(false);
      } else {
        // Session complete
        setShowResult(false);
      }
    }, 2000);
  };

  const skipToNext = () => {
    if (currentProblemIndex < todayProblems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
      setShowResult(false);
    }
  };

  const resetSession = () => {
    setCurrentProblemIndex(0);
    setShowResult(false);
    setSessionStats({
      completed: 0,
      correct: 0,
      startTime: Date.now()
    });
  };

  if (todayProblems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-green-400 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Caught Up! 🎉</h2>
          <p className="text-gray-600 mb-6">
            No problems are due for revision today. Great job staying on top of your practice!
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Add new problems to your bank</li>
              <li>• Review conquered problems</li>
              <li>• Check your analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (currentProblemIndex >= todayProblems.length) {
    const accuracy = sessionStats.completed > 0 ? Math.round((sessionStats.correct / sessionStats.completed) * 100) : 0;
    const timeSpent = Math.round((Date.now() - sessionStats.startTime) / 60000);

    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-green-400 mb-4">
            <Trophy className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Complete! 🎉</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.completed}</div>
              <div className="text-sm text-blue-800">Problems Reviewed</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
              <div className="text-sm text-green-800">Accuracy</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{timeSpent}m</div>
              <div className="text-sm text-purple-800">Time Spent</div>
            </div>
          </div>

          <button
            onClick={resetSession}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentProblemIndex + 1) / todayProblems.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Progress Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today's Revision</h1>
            <p className="text-gray-600">
              Problem {currentProblemIndex + 1} of {todayProblems.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Session Progress</div>
            <div className="text-lg font-semibold text-blue-600">{Math.round(progress)}%</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Problem */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {!showResult ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentProblem.difficulty}
                </div>
                <span className="text-sm text-gray-600">{currentProblem.platform}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {currentProblem.topic}
                </span>
              </div>
              
              {currentProblem.url && (
                <a
                  href={currentProblem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Problem</span>
                </a>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {currentProblem.title}
            </h2>

            {currentProblem.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Your Notes:</h3>
                <p className="text-yellow-700">{currentProblem.notes}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Attempts:</span>
                  <span className="ml-2 font-semibold">{currentProblem.attempts}</span>
                </div>
                <div>
                  <span className="text-gray-600">Correct Streak:</span>
                  <span className="ml-2 font-semibold text-green-600">{currentProblem.consecutiveCorrect}</span>
                </div>
                <div>
                  <span className="text-gray-600">Easy Streak:</span>
                  <span className="ml-2 font-semibold text-blue-600">{currentProblem.consecutiveEasy}</span>
                </div>
                <div>
                  <span className="text-gray-600">Last Practiced:</span>
                  <span className="ml-2 font-semibold">
                    {currentProblem.lastPracticed ? 
                      new Date(currentProblem.lastPracticed).toLocaleDateString() : 
                      'Never'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Take your time to solve this problem. When you're ready, let us know how it went:
              </p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleReview(true, 'Easy')}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Solved Easily</span>
                  </button>
                  
                  <button
                    onClick={() => handleReview(true, 'Hard')}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Brain className="h-5 w-5" />
                    <span>Solved with Difficulty</span>
                  </button>
                </div>
                
                <button
                  onClick={() => handleReview(false, 'Hard')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                  <span>Couldn't Solve</span>
                </button>
                
                <button
                  onClick={skipToNext}
                  className="text-gray-600 hover:text-gray-800 text-sm underline"
                >
                  Skip for now
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-green-400 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Response Recorded!</h3>
            <p className="text-gray-600">Moving to next problem...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionPage;