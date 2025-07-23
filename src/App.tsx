import React, { useState, useMemo } from 'react';
import { Problem } from './types';
import { SpacedRepetitionSystem } from './utils/spacedRepetition';
import { useProblems } from './hooks/useProblems';
import Header from './components/Header';
import Navigation from './components/Navigation';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import ProblemTable from './components/ProblemTable';
import ProblemModal from './components/ProblemModal';
import RevisionPage from './components/RevisionPage';
import ConqueredPage from './components/ConqueredPage';
import AnalyticsPage from './components/AnalyticsPage';
import SyncStatus from './components/SyncStatus';
import { Plus, Download } from 'lucide-react';

function App() {
  const { 
    problems, 
    loading, 
    error, 
    addProblem, 
    updateProblem, 
    deleteProblem, 
    syncWithServer, 
    clearError 
  } = useProblems();
  
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
    if (editingProblem) {
      // Update existing problem
      updateProblem(editingProblem.id, {
        ...problemData,
        createdAt: editingProblem.createdAt
      });
      setEditingProblem(undefined);
    } else {
      // Add new problem
      addProblem(problemData);
    }
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setIsModalOpen(true);
  };

  const handleDeleteProblem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      deleteProblem(id);
    }
  };

  const handleQuickUpdate = (id: string, updates: Partial<Problem>) => {
    updateProblem(id, updates);
  };

  const handleUpdateProblem = (id: string, updates: Partial<Problem>) => {
    updateProblem(id, updates);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProblem(undefined);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(problems, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dsa-problems.json';
    link.click();
    URL.revokeObjectURL(url);
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
              <SyncStatus
                loading={loading}
                error={error}
                onSync={syncWithServer}
                onClearError={clearError}
              />
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
          onUpdateProblem={updateProblem}
        />
      )}

      {currentPage === 'conquered' && (
        <ConqueredPage 
          problems={problems}
          onUpdateProblem={updateProblem}
        />
      )}

      {currentPage === 'analytics' && (
        <AnalyticsPage problems={problems} />
      )}
    </div>
  );
}

export default App;