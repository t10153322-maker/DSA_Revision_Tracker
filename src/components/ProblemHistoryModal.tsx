import React from 'react';
import { X, Calendar, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { Problem } from '../types';

interface ProblemHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
}

const ProblemHistoryModal: React.FC<ProblemHistoryModalProps> = ({ isOpen, onClose, problem }) => {
  if (!isOpen) return null;

  const sortedHistory = [...problem.reviewHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Problem History</h2>
              <p className="text-sm text-gray-600">{problem.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Problem Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Platform:</span>
                <span className="ml-2 font-semibold">{problem.platform}</span>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className={`ml-2 font-semibold ${
                  problem.difficulty === 'Easy' ? 'text-green-600' :
                  problem.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>{problem.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-600">Topic:</span>
                <span className="ml-2 font-semibold">{problem.topic}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 font-semibold ${
                  problem.isConquered ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {problem.isConquered ? 'Conquered' : problem.status}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{problem.attempts}</div>
              <div className="text-sm text-blue-800">Total Attempts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{problem.consecutiveCorrect}</div>
              <div className="text-sm text-green-800">Correct Streak</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{problem.consecutiveEasy}</div>
              <div className="text-sm text-yellow-800">Easy Streak</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{problem.easeFactor.toFixed(1)}</div>
              <div className="text-sm text-purple-800">Ease Factor</div>
            </div>
          </div>

          {/* Review History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review History</h3>
            {sortedHistory.length > 0 ? (
              <div className="space-y-3">
                {sortedHistory.map((review, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          review.wasCorrect ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {review.wasCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {review.wasCorrect ? 'Solved' : 'Failed'} • 
                            <span className={`ml-1 ${
                              review.difficulty === 'Easy' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {review.difficulty === 'Easy' ? 'Easy' : 'With Difficulty'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.timeSpent && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{review.timeSpent}m</span>
                        </div>
                      )}
                    </div>
                    {review.notes && (
                      <div className="bg-gray-50 rounded p-3 mt-2">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Target className="h-12 w-12 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Review History</h4>
                <p className="text-gray-600">This problem hasn't been reviewed yet.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemHistoryModal;