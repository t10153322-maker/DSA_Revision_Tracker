import React from 'react';
import { Problem } from '../types';
import { Clock, Target, Award, Zap } from 'lucide-react';

interface StatsCardsProps {
  problems: Problem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ problems }) => {
  const stats = {
    notStarted: problems.filter(p => p.status === 'Not Started').length,
    practicing: problems.filter(p => p.status === 'Practicing').length,
    solved: problems.filter(p => p.status === 'Solved').length,
    mastered: problems.filter(p => p.status === 'Mastered').length,
  };

  const cards = [
    {
      title: 'Not Started',
      value: stats.notStarted,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      iconBg: 'bg-gray-100'
    },
    {
      title: 'Practicing',
      value: stats.practicing,
      icon: Target,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100'
    },
    {
      title: 'Solved',
      value: stats.solved,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Mastered',
      value: stats.mastered,
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div key={card.title} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${card.iconBg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;