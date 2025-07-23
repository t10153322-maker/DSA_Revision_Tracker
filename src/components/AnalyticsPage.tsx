import React, { useMemo } from 'react';
import { Problem } from '../types';
import { TrendingUp, Calendar, Target, Award, Clock, Brain, AlertTriangle, BookOpen } from 'lucide-react';
import { SpacedRepetitionSystem } from '../utils/spacedRepetition';

interface AnalyticsPageProps {
  problems: Problem[];
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ problems }) => {
  const analytics = useMemo(() => {
    const totalProblems = problems.length;
    const conqueredProblems = problems.filter(p => p.isConquered).length;
    const activePractice = problems.filter(p => !p.isConquered && p.attempts > 0).length;
    
    // Topic distribution
    const topicStats = problems.reduce((acc, problem) => {
      if (!acc[problem.topic]) {
        acc[problem.topic] = {
          total: 0,
          conquered: 0,
          practicing: 0,
          notStarted: 0
        };
      }
      acc[problem.topic].total++;
      if (problem.isConquered) {
        acc[problem.topic].conquered++;
      } else if (problem.attempts > 0) {
        acc[problem.topic].practicing++;
      } else {
        acc[problem.topic].notStarted++;
      }
      return acc;
    }, {} as Record<string, { total: number; conquered: number; practicing: number; notStarted: number }>);

    // Difficulty distribution
    const difficultyStats = problems.reduce((acc, problem) => {
      acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = problems.filter(p => 
      p.lastPracticed && new Date(p.lastPracticed) >= sevenDaysAgo
    ).length;

    // Average attempts for solved problems
    const solvedProblems = problems.filter(p => p.consecutiveCorrect > 0);
    const avgAttempts = solvedProblems.length > 0 
      ? Math.round(solvedProblems.reduce((sum, p) => sum + p.attempts, 0) / solvedProblems.length)
      : 0;

    // Get weak topics
    const weakTopics = SpacedRepetitionSystem.getWeakTopics(problems);

    // Get upcoming reviews
    const upcomingReviews = SpacedRepetitionSystem.getUpcomingReviews(problems, 7);

    return {
      totalProblems,
      conqueredProblems,
      activePractice,
      topicStats,
      difficultyStats,
      recentActivity,
      avgAttempts,
      masteryRate: totalProblems > 0 ? Math.round((conqueredProblems / totalProblems) * 100) : 0,
      weakTopics,
      upcomingReviews
    };
  }, [problems]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights into your DSA practice journey</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Problems</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.totalProblems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conquered</p>
              <p className="text-2xl font-bold text-yellow-600">{analytics.conqueredProblems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mastery Rate</p>
              <p className="text-2xl font-bold text-green-600">{analytics.masteryRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.recentActivity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics Alert */}
      {analytics.weakTopics.length > 0 && (
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-orange-900">Topics Needing Attention</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.weakTopics.map((topic) => (
              <div key={topic.topic} className="bg-white rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">{topic.topic}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Failure Rate: <span className="font-semibold text-orange-600">{topic.failureRate.toFixed(1)}%</span></div>
                  <div>Problems: <span className="font-semibold">{topic.problemCount}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Topic Distribution</h2>
          <div className="space-y-4">
            {Object.entries(analytics.topicStats).map(([topic, stats]) => (
              <div key={topic} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{topic}</h3>
                  <span className="text-sm text-gray-600">{stats.total} problems</span>
                </div>
                <div className="flex space-x-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-yellow-500"
                    style={{ width: `${(stats.conquered / stats.total) * 100}%` }}
                    title={`${stats.conquered} conquered`}
                  />
                  <div 
                    className="bg-blue-500"
                    style={{ width: `${(stats.practicing / stats.total) * 100}%` }}
                    title={`${stats.practicing} practicing`}
                  />
                  <div 
                    className="bg-gray-400"
                    style={{ width: `${(stats.notStarted / stats.total) * 100}%` }}
                    title={`${stats.notStarted} not started`}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>{stats.conquered} conquered</span>
                  <span>{stats.practicing} practicing</span>
                  <span>{stats.notStarted} not started</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Difficulty Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(analytics.difficultyStats).map(([difficulty, count]) => {
              const percentage = Math.round((count / analytics.totalProblems) * 100);
              const color = difficulty === 'Easy' ? 'green' : difficulty === 'Medium' ? 'yellow' : 'red';
              
              return (
                <div key={difficulty} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-${color}-500`} />
                    <span className="font-medium text-gray-900">{difficulty}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Reviews */}
      {analytics.upcomingReviews.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Reviews (Next 7 Days)</h2>
          </div>
          <div className="space-y-3">
            {analytics.upcomingReviews.slice(0, 10).map((problem) => (
              <div key={problem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">{problem.title}</div>
                    <div className="text-sm text-gray-600">{problem.topic} • {problem.difficulty}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {problem.nextReviewDate ? new Date(problem.nextReviewDate).toLocaleDateString() : 'TBD'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Average Attempts to Solve</h3>
            <div className="text-2xl font-bold text-blue-600">{analytics.avgAttempts}</div>
            <p className="text-sm text-blue-800">
              {analytics.avgAttempts <= 2 ? 'Outstanding problem-solving efficiency!' :
               analytics.avgAttempts <= 4 ? 'Excellent progress, keep it up!' :
               analytics.avgAttempts <= 6 ? 'Good progress, keep practicing!' :
               'Focus on understanding patterns to improve efficiency.'}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Weekly Activity</h3>
            <div className="text-2xl font-bold text-green-600">{analytics.recentActivity}</div>
            <p className="text-sm text-green-800">
              {analytics.recentActivity >= 7 ? 'Outstanding daily consistency!' :
               analytics.recentActivity >= 5 ? 'Great consistency this week!' :
               analytics.recentActivity >= 3 ? 'Good practice frequency!' :
               'Try to practice more regularly for better retention.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;