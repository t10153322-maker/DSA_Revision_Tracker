import React, { useState, useMemo } from 'react';
import { Problem } from './types';
import { SpacedRepetitionSystem } from './utils/spacedRepetition';
import useLocalStorage from './hooks/useLocalStorage';
import Header from './components/Header';
import Navigation from './components/Navigation';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import ProblemTable from './components/ProblemTable';
import ProblemModal from './components/ProblemModal';
import RevisionPage from './components/RevisionPage';
import ConqueredPage from './components/ConqueredPage';
import AnalyticsPage from './components/AnalyticsPage';
import { Plus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

function App() {
  const [problems, setProblems] = useLocalStorage<Problem[]>('dsa-problems', []);
  const [currentPage, setCurrentPage] = useState<'tracker' | 'revision' | 'conquered' | 'analytics'>('tracker');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | undefined>();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

  // Get problems for today's revision
  const todayProblems = useMemo(() => {
    return SpacedRepetitionSystem.getProblemsForToday(problems);
  }, [problems]);

  const conqueredProblems = useMemo(() => {
    return SpacedRepetitionSystem.getConqueredProblems(problems);
  }, [problems]);

  // Get unique topics for filter dropdown
  const topics = useMemo(() => {
    const topicSet = new Set(problems.map(p => p.topic));
    return Array.from(topicSet).sort();
  }, [problems]);

  // Filter problems based on current filters
  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          problem.platform.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter;
      const matchesStatus = !statusFilter || problem.status === statusFilter;
      const matchesTopic = !topicFilter || problem.topic === topicFilter;
      
      return matchesSearch && matchesDifficulty && matchesStatus && matchesTopic;
    });
  }, [problems, searchTerm, difficultyFilter, statusFilter, topicFilter]);

  const solvedProblems = problems.filter(p => p.status === 'Solved' || p.status === 'Mastered').length;

  const handleSaveProblem = (problemData: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingProblem) {
      // Update existing problem
      setProblems(prev => prev.map(p => 
        p.id === editingProblem.id 
          ? { ...problemData, id: editingProblem.id, createdAt: editingProblem.createdAt, updatedAt: now }
          : p
      ));
      setEditingProblem(undefined);
    } else {
      // Add new problem
      const newProblem = SpacedRepetitionSystem.initializeProblem({
        ...problemData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
        status: 'Not Started',
        attempts: 0
      });
      setProblems(prev => [...prev, newProblem]);
    }
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleDeleteProblem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      setProblems(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleQuickUpdate = (id: string, updates: Partial<Problem>) => {
    setProblems(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleUpdateProblem = (id: string, updates: Partial<Problem>) => {
    setProblems(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProblem(undefined);
  };

  const exportData = () => {
    // Prepare data for Excel export
    const exportData = problems.map(problem => {
      const getStatusText = (p: Problem) => {
        if (p.isConquered) return 'Conquered';
        if (p.attempts === 0) return 'Not Started';
        if (p.consecutiveCorrect >= 3) return 'Mastered';
        if (p.consecutiveCorrect >= 1) return 'Solved';
        return 'Practicing';
      };

      return {
        'Title': problem.title,
        'Platform': problem.platform,
        'Difficulty': problem.difficulty,
        'Topic': problem.topic,
        'URL': problem.url || '',
        'Status': getStatusText(problem),
        'Total Attempts': problem.attempts,
        'Consecutive Correct': problem.consecutiveCorrect,
        'Consecutive Easy': problem.consecutiveEasy,
        'Easy Factor': problem.easeFactor.toFixed(2),
        'Interval (days)': problem.interval,
        'Next Review Date': problem.nextReviewDate || '',
        'Last Practiced': problem.lastPracticed || '',
        'Is Conquered': problem.isConquered ? 'Yes' : 'No',
        'Notes': problem.notes || '',
        'Created At': new Date(problem.createdAt).toLocaleString(),
        'Updated At': new Date(problem.updatedAt).toLocaleString(),
        'Review History Count': problem.reviewHistory.length,
        'Success Rate': problem.reviewHistory.length > 0 ? 
          `${Math.round((problem.reviewHistory.filter(r => r.wasCorrect).length / problem.reviewHistory.length) * 100)}%` : '0%'
      };
    });

    // Create history sheet
    const historyData = problems.flatMap(problem => 
      problem.reviewHistory.map(review => ({
        'Problem Title': problem.title,
        'Review Date': new Date(review.date).toLocaleString(),
        'Was Correct': review.wasCorrect ? 'Yes' : 'No',
        'Difficulty': review.difficulty,
        'Notes': review.notes || '',
        'Time Spent (min)': review.timeSpent || ''
      }))
    );

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add problems sheet
    const ws1 = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Problems');
    
    // Add history sheet
    const ws2 = XLSX.utils.json_to_sheet(historyData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Review History');
    
    // Save file
    XLSX.writeFile(wb, `DSA_Problems_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totalProblems={problems.length} solvedProblems={solvedProblems} />
      <Navigation 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        todayCount={todayProblems.length}
        conqueredCount={conqueredProblems.length}
      />
      
      {currentPage === 'tracker' && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <StatsCards problems={problems} />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Problem Bank</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track your DSA practice problems</p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Problem</span>
              </button>
            </div>
          </div>

          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            topicFilter={topicFilter}
            setTopicFilter={setTopicFilter}
            topics={topics}
          />

          <ProblemTable
            problems={filteredProblems}
            onEdit={handleEditProblem}
            onDelete={handleDeleteProblem}
            onQuickUpdate={handleQuickUpdate}
          />

          <ProblemModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveProblem}
            problem={editingProblem}
          />
        </div>
      )}

      {currentPage === 'revision' && (
        <RevisionPage 
          problems={problems}
          onUpdateProblem={handleUpdateProblem}
        />
      )}

      {currentPage === 'conquered' && (
        <ConqueredPage 
          problems={problems}
          onUpdateProblem={handleUpdateProblem}
        />
      )}

      {currentPage === 'analytics' && (
        <AnalyticsPage problems={problems} />
      )}
    </div>
  );
}

export default App;