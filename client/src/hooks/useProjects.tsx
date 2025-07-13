import { useState, useEffect } from 'react';
import { projects, ApiError } from '../lib/api';
import { Project, InsertProject, UpdateProject } from '@shared/schema';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

export function useProjects() {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
  });

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  // Load all projects
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projects.getAll();
      setState(prev => ({
        ...prev,
        projects: response.projects,
        isLoading: false,
      }));
    } catch (error) {
      setLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load projects');
      }
    }
  };

  // Load a specific project
  const loadProject = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projects.get(id);
      setState(prev => ({
        ...prev,
        currentProject: response.project,
        isLoading: false,
      }));
      
      return response.project;
    } catch (error) {
      setLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load project');
      }
      throw error;
    }
  };

  // Create a new project
  const createProject = async (projectData: Omit<InsertProject, 'userId'>) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projects.create(projectData);
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, response.project],
        currentProject: response.project,
        isLoading: false,
      }));
      
      return response.project;
    } catch (error) {
      setLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to create project');
      }
      throw error;
    }
  };

  // Update a project
  const updateProject = async (id: number, updates: UpdateProject) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projects.update(id, updates);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === id ? response.project : p
        ),
        currentProject: prev.currentProject?.id === id 
          ? response.project 
          : prev.currentProject,
        isLoading: false,
      }));
      
      return response.project;
    } catch (error) {
      setLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to update project');
      }
      throw error;
    }
  };

  // Delete a project
  const deleteProject = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await projects.delete(id);
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        currentProject: prev.currentProject?.id === id 
          ? null 
          : prev.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      setLoading(false);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to delete project');
      }
      throw error;
    }
  };

  // Set current project from existing projects
  const setCurrentProject = (project: Project | null) => {
    setState(prev => ({ ...prev, currentProject: project }));
  };

  // Clear error
  const clearError = () => setError(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  return {
    ...state,
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    clearError,
  };
}
