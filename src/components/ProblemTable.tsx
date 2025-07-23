import React from 'react';
import { Problem } from '../types';
import { ExternalLink, Edit2, Trash2, Clock, History } from 'lucide-react';
import ProblemHistoryModal from './ProblemHistoryModal';

interface ProblemTableProps {
  problems: Problem[];
  onEdit: (problem: Problem) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<Problem>) => void;
}

const ProblemTable: React.FC<ProblemTableProps> = ({ problems, onEdit, onDelete, onQuickUpdate }) => {
  const [historyModal, setHistoryModal] = React.useState<{ isOpen: boolean; problem: Problem | null }>({
    isOpen: false,
    problem: null
  });

  const getDifficultyColor = (difficulty: Problem['difficulty']) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleShowHistory = (problem: Problem) => {
    setHistoryModal({ isOpen: true, problem });
  };

  const getStatusDisplay = (problem: Problem) => {
    if (problem.isConquered) {
      return { text: 'Conquered', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (problem.attempts === 0) {
      return { text: 'Not Started', color: 'bg-gray-100 text-gray-800' };
    }
    if (problem.consecutiveCorrect >= 3) {
      return { text: 'Mastered', color: 'bg-blue-100 text-blue-800' };
    }
    if (problem.consecutiveCorrect >= 1) {
      return { text: 'Solved', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'Practicing', color: 'bg-yellow-100 text-yellow-800' };
  };

  if (problems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Clock className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
        <p className="text-gray-600">Add your first problem to start tracking your DSA journey!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Practiced
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {problems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                      {problem.url && (
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center mt-1"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Problem
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {problem.platform}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {problem.topic}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusDisplay(problem).color}`}>
                    {getStatusDisplay(problem).text}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{problem.attempts}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {problem.lastPracticed ? new Date(problem.lastPracticed).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleShowHistory(problem)}
                      className="text-purple-600 hover:text-purple-800 p-1 hover:bg-purple-50 rounded transition-colors"
                      title="View History"
                    >
                      <History className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(problem)}
                      className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(problem.id)}
                      className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ProblemHistoryModal
        isOpen={historyModal.isOpen}
        onClose={() => setHistoryModal({ isOpen: false, problem: null })}
        problem={historyModal.problem!}
      />
    </div>
  );
};

export default ProblemTable;