import React from 'react';
import { Problem } from '../types';
import { ExternalLink, Edit2, Trash2, Clock } from 'lucide-react';

interface ProblemTableProps {
  problems: Problem[];
  onEdit: (problem: Problem) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<Problem>) => void;
}

const ProblemTable: React.FC<ProblemTableProps> = ({ problems, onEdit, onDelete, onQuickUpdate }) => {
  const getStatusColor = (status: Problem['status']) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'Practicing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Solved':
        return 'bg-green-100 text-green-800';
      case 'Mastered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handleStatusChange = (id: string, newStatus: Problem['status']) => {
    const now = new Date().toISOString().split('T')[0];
    onQuickUpdate(id, { 
      status: newStatus,
      lastPracticed: now,
      updatedAt: new Date().toISOString()
    });
  };

  const handlePracticeSession = (id: string) => {
    const problem = problems.find(p => p.id === id);
    if (problem) {
      const now = new Date().toISOString().split('T')[0];
      onQuickUpdate(id, {
        attempts: problem.attempts + 1,
        lastPracticed: now,
        updatedAt: new Date().toISOString()
      });
    }
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
                  <select
                    value={problem.status}
                    onChange={(e) => handleStatusChange(problem.id, e.target.value as Problem['status'])}
                    className={`px-2 py-1 text-xs font-medium rounded-full border-none cursor-pointer ${getStatusColor(problem.status)}`}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Practicing">Practicing</option>
                    <option value="Solved">Solved</option>
                    <option value="Mastered">Mastered</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">{problem.attempts}</span>
                    <button
                      onClick={() => handlePracticeSession(problem.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      +1
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {problem.lastPracticed ? new Date(problem.lastPracticed).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
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
    </div>
  );
};

export default ProblemTable;