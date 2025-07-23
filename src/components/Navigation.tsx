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
              className={`flex items-center space-x-2 py-4 px-3 border-b-2 transition-colors relative ${
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
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.id === 'revision' && item.badge > 0 
                        ? 'bg-red-100 text-red-800 animate-pulse' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              {item.id === 'revision' && item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;