import React from 'react';
import { BookOpen, Calendar, Trophy, BarChart3 } from 'lucide-react';

interface NavigationProps {
  currentPage: 'tracker' | 'revision' | 'conquered' | 'analytics';
  onPageChange: (page: 'tracker' | 'revision' | 'conquered' | 'analytics') => void;
  todayCount: number;
  conqueredCount: number;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, todayCount, conqueredCount }) => {
  const navItems = [
    {
      id: 'tracker' as const,
      label: 'Problem Bank',
      icon: BookOpen,
      description: 'Manage all problems'
    },
    {
      id: 'revision' as const,
      label: 'Today\'s Revision',
      icon: Calendar,
      description: `${todayCount} problems due`,
      badge: todayCount > 0 ? todayCount : undefined
    },
    {
      id: 'conquered' as const,
      label: 'Conquered',
      icon: Trophy,
      description: `${conqueredCount} mastered`,
      badge: conqueredCount > 0 ? conqueredCount : undefined
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Progress insights'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors ${
                currentPage === item.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;