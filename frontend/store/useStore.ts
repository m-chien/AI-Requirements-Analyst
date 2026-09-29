import { create } from 'zustand';

export type Traceability = 'SUPPORTED' | 'INFERRED' | 'AMBIGUOUS' | 'UNSUPPORTED';
export type ReqStatus = 'Draft' | 'Needs Review' | 'Needs Clarification' | 'Approved' | 'Rejected';

export interface Requirement {
  id: string;
  text: string;
  module: string;
  type: string;
  traceability: Traceability;
  status: ReqStatus;
  warning?: string;
  sourceEvidence?: string;
  baNote?: string;
}

export interface UserStory {
  id: string;
  role: string;
  action: string;
  benefit: string;
  status: ReqStatus;
  acceptanceCriteria: string[];
}

export interface Ambiguity {
  id: string;
  problem: string;
  status: ReqStatus;
}

export interface Conflict {
  id: string;
  description: string;
  status: ReqStatus;
}

export interface MissingInfo {
  id: string;
  description: string;
  status: ReqStatus;
}

export interface Question {
  id: string;
  question: string;
  status: 'Open' | 'Answered' | 'Resolved';
}

export interface SourceDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  createdAt: string;
  status: 'Draft' | 'Analyzed';
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description: string;
  status: string;
  sources: SourceDocument[];
  requirements: Requirement[];
  userStories: UserStory[];
  ambiguities: Ambiguity[];
  conflicts: Conflict[];
  missingInfo: MissingInfo[];
  questions: Question[];
  actors: string[];
  updatedAt: string;
}

interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProject: (id: string) => void;
  setProjects: (projects: Project[]) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  addProject: (p: Project) => void;
  updateRequirement: (projectId: string, reqId: string, data: Partial<Requirement>) => void;
  deleteRequirement: (projectId: string, reqId: string) => void;
  updateSource: (projectId: string, sourceId: string, data: Partial<SourceDocument>) => void;
}

// Initial mock data removed - now fetched from BE
const initialProjects: Project[] = [];

export const useStore = create<AppState>((set) => ({
  projects: initialProjects,
  activeProjectId: null,
  
  setActiveProject: (id) => set({ activeProjectId: id }),
  
  setProjects: (projects) => set({ projects }),
  
  updateProject: (id, data) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...data } : p)
  })),
  
  addProject: (p) => set((state) => ({
    projects: [p, ...state.projects]
  })),

  updateRequirement: (projectId, reqId, data) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        requirements: p.requirements.map(r => r.id === reqId ? { ...r, ...data } : r)
      };
    })
  })),

  deleteRequirement: (projectId, reqId) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        requirements: p.requirements.filter(r => r.id !== reqId)
      };
    })
  })),

  updateSource: (projectId, sourceId, data) => set((state) => ({
    projects: state.projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        sources: p.sources.map(s => s.id === sourceId ? { ...s, ...data } : s)
      };
    })
  })),
}));
