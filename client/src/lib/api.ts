import { InsertUser, InsertProject, UpdateProject, User, Project } from "@shared/schema";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// API Response Types
interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  [key: string]: any;
}

interface AuthResponse extends ApiResponse {
  user: Pick<User, 'id' | 'username'>;
}

interface ProjectResponse extends ApiResponse {
  project: Project;
}

interface ProjectsResponse extends ApiResponse {
  projects: Project[];
}

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies for session management
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Authentication Methods
  async register(userData: InsertUser): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/api/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/me');
  }

  // Project Methods
  async getProjects(): Promise<ProjectsResponse> {
    return this.request<ProjectsResponse>('/api/projects');
  }

  async getProject(id: number): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/api/projects/${id}`);
  }

  async createProject(projectData: Omit<InsertProject, 'userId'>): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: number, updates: UpdateProject): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(id: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Convenience functions
export const auth = {
  register: (userData: InsertUser) => apiClient.register(userData),
  login: (username: string, password: string) => apiClient.login(username, password),
  logout: () => apiClient.logout(),
  getCurrentUser: () => apiClient.getCurrentUser(),
};

export const projects = {
  getAll: () => apiClient.getProjects(),
  get: (id: number) => apiClient.getProject(id),
  create: (data: Omit<InsertProject, 'userId'>) => apiClient.createProject(data),
  update: (id: number, updates: UpdateProject) => apiClient.updateProject(id, updates),
  delete: (id: number) => apiClient.deleteProject(id),
};

// Export types for use in components
export type { ApiError, AuthResponse, ProjectResponse, ProjectsResponse };
