import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { X } from 'lucide-react';

// Common dropdown options
const PLATFORMS = [
  'LeetCode', 'CodeForces', 'HackerRank', 'GeeksforGeeks', 'InterviewBit', 
  'CodeChef', 'AtCoder', 'TopCoder', 'SPOJ', 'HackerEarth', 'Other'
];

const TOPICS = [
  'Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Binary Tree',
  'Binary Search Tree', 'Heap', 'Hash Table', 'Graph', 'Dynamic Programming',
  'Greedy', 'Backtracking', 'Divide and Conquer', 'Two Pointers', 'Sliding Window',
  'Binary Search', 'Sorting', 'Bit Manipulation', 'Math', 'Recursion', 'Trie',
  'Union Find', 'Segment Tree', 'Fenwick Tree', 'Other'
];

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  problem?: Problem;
}

const ProblemModal: React.FC<ProblemModalProps> = ({ isOpen, onClose, onSave, problem }) => {
  const [formData, setFormData] = useState({
    title: '',
    platform: '',
    difficulty: 'Medium' as Problem['difficulty'],
    topic: '',
    url: '',
    status: 'Not Started' as Problem['status'],
    attempts: 0,
    lastPracticed: '',
    notes: ''
  });

  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title,
        platform: problem.platform,
        difficulty: problem.difficulty,
        topic: problem.topic,
        url: problem.url || '',
        status: problem.status,
        attempts: problem.attempts,
        lastPracticed: problem.lastPracticed || '',
        notes: problem.notes || ''
      });
    } else {
      setFormData({
        title: '',
        platform: '',
        difficulty: 'Medium',
        topic: '',
        url: '',
        status: 'Not Started',
        attempts: 0,
        lastPracticed: '',
        notes: ''
      });
    }
  }, [problem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {problem ? 'Edit Problem' : 'Add New Problem'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform *
              </label>
              <select
                required
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Platform</option>
                {PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              {formData.platform === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter custom platform"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Problem['difficulty'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topic *
              </label>
              <select
                required
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Topic</option>
                {TOPICS.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              {formData.topic === 'Other' && (
                <input
                type="text"
                  placeholder="Enter custom topic"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                />
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Problem URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Problem['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Not Started">Not Started</option>
                <option value="Practicing">Practicing</option>
                <option value="Solved">Solved</option>
                <option value="Mastered">Mastered</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attempts
              </label>
              <input
                type="number"
                min="0"
                value={formData.attempts}
                onChange={(e) => setFormData({ ...formData, attempts: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Practiced
            </label>
            <input
              type="date"
              value={formData.lastPracticed}
              onChange={(e) => setFormData({ ...formData, lastPracticed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add your notes, hints, or key insights..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {problem ? 'Update Problem' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;