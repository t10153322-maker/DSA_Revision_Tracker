import { useState, useEffect, useCallback } from 'react';
import { Problem } from '../types';
import { ApiService } from '../services/api';
import useLocalStorage from './useLocalStorage';

interface UseProblemsReturn {
  problems: Problem[];
  loading: boolean;
  error: string | null;
  addProblem: (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProblem: (id: string, updates: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  syncWithServer: () => Promise<void>;
  clearError: () => void;
}

export const useProblems = (): UseProblemsReturn => {
  const [localProblems, setLocalProblems] = useLocalStorage<Problem[]>('dsa-problems', []);
  const [problems, setProblems] = useState<Problem[]>(localProblems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load problems from API on mount
  useEffect(() => {
    loadProblems();
  }, []);

  // Sync local storage whenever problems change
  useEffect(() => {
    setLocalProblems(problems);
  }, [problems, setLocalProblems]);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getProblems();
      
      if (response.success && response.data) {
        setProblems(response.data);
      } else {
        // If API fails, use local storage data
        console.warn('Failed to load from API, using local storage:', response.error);
        setProblems(localProblems);
        setError('Using offline data - API unavailable');
      }
    } catch (err) {
      console.error('Error loading problems:', err);
      setProblems(localProblems);
      setError('Using offline data - Network error');
    } finally {
      setLoading(false);
    }
  }, [localProblems]);

  const addProblem = useCallback(async (problemData: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const tempId = Date.now().toString();
    
    // Create problem with temporary ID for immediate UI update
    const newProblem: Problem = {
      ...problemData,
      id: tempId,
      createdAt: now,
      updatedAt: now,
      status: 'Not Started',
      attempts: 0,
      easeFactor: 2.5,
      interval: 1,
      consecutiveCorrect: 0,
      consecutiveEasy: 0,
      isConquered: false,
      reviewHistory: [],
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    // Optimistically update UI
    setProblems(prev => [...prev, newProblem]);

    try {
      const response = await ApiService.createProblem(problemData);
      
      if (response.success && response.data) {
        // Replace temporary problem with server response
        setProblems(prev => prev.map(p => p.id === tempId ? response.data! : p));
      } else {
        console.warn('Failed to create problem on server:', response.error);
        setError('Problem saved locally only - Server sync failed');
      }
    } catch (err) {
      console.error('Error creating problem:', err);
      setError('Problem saved locally only - Network error');
    }
  }, []);

  const updateProblem = useCallback(async (id: string, updates: Partial<Problem>) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };
    
    // Optimistically update UI
    setProblems(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));

    try {
      const response = await ApiService.updateProblem(id, updatedData);
      
      if (response.success && response.data) {
        // Update with server response
        setProblems(prev => prev.map(p => p.id === id ? response.data! : p));
      } else {
        console.warn('Failed to update problem on server:', response.error);
        setError('Changes saved locally only - Server sync failed');
      }
    } catch (err) {
      console.error('Error updating problem:', err);
      setError('Changes saved locally only - Network error');
    }
  }, []);

  const deleteProblem = useCallback(async (id: string) => {
    // Optimistically update UI
    setProblems(prev => prev.filter(p => p.id !== id));

    try {
      const response = await ApiService.deleteProblem(id);
      
      if (!response.success) {
        console.warn('Failed to delete problem on server:', response.error);
        setError('Problem deleted locally only - Server sync failed');
      }
    } catch (err) {
      console.error('Error deleting problem:', err);
      setError('Problem deleted locally only - Network error');
    }
  }, []);

  const syncWithServer = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.syncProblems(problems);
      
      if (response.success && response.data) {
        setProblems(response.data);
        setError(null);
      } else {
        setError('Sync failed: ' + response.error);
      }
    } catch (err) {
      console.error('Error syncing with server:', err);
      setError('Sync failed: Network error');
    } finally {
      setLoading(false);
    }
  }, [problems]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    problems,
    loading,
    error,
    addProblem,
    updateProblem,
    deleteProblem,
    syncWithServer,
    clearError,
  };
};