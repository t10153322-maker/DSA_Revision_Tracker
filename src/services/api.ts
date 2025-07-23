const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  static async getProblems(): Promise<ApiResponse<Problem[]>> {
    return this.request<Problem[]>('/problems');
  }

  static async createProblem(problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Problem>> {
    return this.request<Problem>('/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
    });
  }

  static async updateProblem(id: string, updates: Partial<Problem>): Promise<ApiResponse<Problem>> {
    return this.request<Problem>(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  static async deleteProblem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/problems/${id}`, {
      method: 'DELETE',
    });
  }

  static async syncProblems(problems: Problem[]): Promise<ApiResponse<Problem[]>> {
    return this.request<Problem[]>('/problems/sync', {
      method: 'POST',
      body: JSON.stringify({ problems }),
    });
  }
}

// Import Problem type
import { Problem } from '../types';