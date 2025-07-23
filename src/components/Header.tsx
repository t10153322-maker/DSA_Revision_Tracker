import React from 'react';
import { BookOpen, TrendingUp } from 'lucide-react';

interface HeaderProps {
  totalProblems: number;
  solvedProblems: number;
}

const Header: React.FC<HeaderProps> = ({ totalProblems, solvedProblems }) => {
  const progressPercentage = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DSA Revision Tracker</h1>
              <p className="text-sm text-gray-600">Track your problem-solving journey</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalProblems}</div>
              <div className="text-sm text-gray-600">Total Problems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{solvedProblems}</div>
              <div className="text-sm text-gray-600">Solved</div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{progressPercentage}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;