export type Priority = "low" | "med" | "high";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  priority: Priority;
  projectId?: string;
  order?: number;
  subtasks?: Subtask[];
  reminderAt?: number;
  notes?: string;
  durationMins?: number;
  completedAt?: number;
}

export interface Project {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

/**
 * Template = blueprint to create ANY NUMBER of tasks
 */
export type Template = {
  id: string;
  name: string;
  createdAt: number;

  blueprint: {
    priority: Priority;
    notes: string;
    subtaskCount: number;
    subtaskNames: string[];
  };
};
