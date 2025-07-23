import React from 'react';
import { Problem } from '../types';
import { Trophy, Calendar, Target, ExternalLink } from 'lucide-react';

interface ConqueredPageProps {
  problems: Problem[];
  onUpdateProblem: (id: string, updates: Partial<Problem>) => void;
}

const ConqueredPage: React.FC<ConqueredPageProps> = ({ problems, onUpdateProblem }) => {
  const conqueredProblems = problems.filter(p => p.isConquered);

  const handleMoveBackToPractice = (problemId: string) => {
    const today = new Date().toISOString().split('T')[0];
    onUpdateProblem(problemId, {
      isConquered: false,
      consecutiveEasy: 0,
      nextReviewDate: today,
      interval: 1,
      updatedAt: new Date().toISOString()
    });
  };

  if (conqueredProblems.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Trophy className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Conquered Problems Yet</h2>
          <p className="text-gray-600 mb-6">
            Keep practicing! Problems will appear here once you solve them easily 5 times in a row.
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to conquer problems:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Solve the problem correctly</li>
              <li>• Mark it as "Solved Easily" 5 times consecutively</li>
              <li>• The problem will automatically move to conquered status</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const groupedByTopic = conqueredProblems.reduce((acc, problem) => {
    if (!acc[problem.topic]) {
      acc[problem.topic] = [];
    }
    acc[problem.topic].push(problem);
    return acc;
  }, {} as Record<string, Problem[]>);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Trophy className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conquered Problems</h1>
            <p className="text-gray-600">Problems you've mastered through consistent practice</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{conqueredProblems.length}</div>
              <div className="text-sm text-yellow-800">Total Conquered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{Object.keys(groupedByTopic).length}</div>
              <div className="text-sm text-orange-800">Topics Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {Math.round((conqueredProblems.length / problems.length) * 100) || 0}%
              </div>
              <div className="text-sm text-red-800">Mastery Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedByTopic).map(([topic, topicProblems]) => (
          <div key={topic} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">{topic}</h2>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                  {topicProblems.length} conquered
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topicProblems.map((problem) => (
                  <div key={problem.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {problem.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Target className="h-3 w-3" />
                        <span>{problem.platform}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Last: {problem.lastPracticed ? 
                            new Date(problem.lastPracticed).toLocaleDateString() : 
                            'Never'
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-3 w-3" />
                        <span>{problem.consecutiveEasy} easy solves</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {problem.url && (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      )}
                      
                      <button
                        onClick={() => handleMoveBackToPractice(problem.id)}
                        className="text-xs text-gray-600 hover:text-gray-800 underline"
                      >
                        Move to Practice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConqueredPage;