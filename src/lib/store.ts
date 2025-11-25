import { create } from "zustand";
import { Task, Project, Subtask, Template, Priority } from "../types";
import {
  loadTasks,
  persistTasks,
  loadProjects,
  persistProjects,
  loadTemplates,
  persistTemplates,
  loadStats,
  persistStats,
} from "./storage";

// -------------------------------
// Reminder timers
// -------------------------------
const reminderTimers: Record<string, number> = {};

// Schedule reminder for a single task
function scheduleReminder(t: Task) {
  if (!t.reminderAt || t.completed) return;

  const timeLeft = t.reminderAt - Date.now();
  if (timeLeft <= 0) return;

  if (reminderTimers[t.id]) {
    clearTimeout(reminderTimers[t.id]);
  }

  reminderTimers[t.id] = window.setTimeout(() => {
    if (Notification.permission === "granted") {
      new Notification("Reminder", { body: t.title });
    } else {
      console.log("Reminder:", t.title);
    }
  }, timeLeft);
}

// -------------------------------
// Store interface
// -------------------------------
interface Store {
  tasks: Task[];
  projects: Project[];
  templates: Template[];
  stats: any;
  initLoaded: boolean;

  load: () => Promise<void>;

  addTask: (t: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  reorderTasks: (projectId: string | undefined, orderedIds: string[]) => void;

  addProject: (p: Project) => void;
  removeProject: (id: string) => void;

  addSubtask: (taskId: string, st: Subtask) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;

  addTemplate: (tm: Template) => void;

  updateTemplate: (id: string, patch: any) => void;
  removeTemplate: (
    id: string,
    options?: { removeAssociatedTasks?: boolean }
  ) => void;

  applyTemplate: (id: string, projectId?: string) => void;

  recordComplete: (taskId: string) => void;

  scheduleReminders: () => void;

  clear: () => void;
}

// -------------------------------
// Main Store
// -------------------------------
export const useStore = create<Store>((set, get) => ({
  tasks: [],
  projects: [],
  templates: [],
  stats: {},
  initLoaded: false,

  // ---------------------------
  // Initial Load
  // ---------------------------
  load: async () => {
    const [tasks, projects, templates, stats] = await Promise.all([
      loadTasks(),
      loadProjects(),
      loadTemplates(),
      loadStats(),
    ]);

    set({ tasks, projects, templates, stats, initLoaded: true });

    setTimeout(() => get().scheduleReminders(), 200);
  },

  // ---------------------------
  // Task CRUD
  // ---------------------------
  addTask: (t) => {
    const next = [...get().tasks, t];
    set({ tasks: next });
    persistTasks(next);
    scheduleReminder(t);
  },

  updateTask: (id, patch) => {
    const next = get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
    set({ tasks: next });
    persistTasks(next);

    const updated = next.find((t) => t.id === id);
    if (updated) scheduleReminder(updated);
  },

  toggleTask: (id) => {
    const next = get().tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? Date.now() : undefined,
          }
        : t
    );

    set({ tasks: next });
    persistTasks(next);

    const updated = next.find((t) => t.id === id);
    if (updated) scheduleReminder(updated);

    if (updated?.completed) get().recordComplete(id);
  },

  removeTask: (id) => {
    if (reminderTimers[id]) {
      clearTimeout(reminderTimers[id]);
      delete reminderTimers[id];
    }

    const next = get().tasks.filter((t) => t.id !== id);
    set({ tasks: next });
    persistTasks(next);
  },

  reorderTasks: (_, orderedIds) => {
    const orderMap = Object.fromEntries(
      orderedIds.map((id, index) => [id, index])
    );

    const next = get().tasks.map((t) =>
      orderMap[t.id] !== undefined ? { ...t, order: orderMap[t.id] } : t
    );

    set({ tasks: next });
    persistTasks(next);
  },

  // ---------------------------
  // Projects
  // ---------------------------
  addProject: (p) => {
    const next = [...get().projects, p];
    set({ projects: next });
    persistProjects(next);
  },

  removeProject: (id) => {
    const next = get().projects.filter((p) => p.id !== id);
    set({ projects: next });
    persistProjects(next);

    const updatedTasks = get().tasks.map((t) =>
      t.projectId === id ? { ...t, projectId: undefined } : t
    );

    set({ tasks: updatedTasks });
    persistTasks(updatedTasks);
  },

  // ---------------------------
  // Subtasks
  // ---------------------------
  addSubtask: (taskId, st) => {
    const next = get().tasks.map((t) =>
      t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), st] } : t
    );

    set({ tasks: next });
    persistTasks(next);
  },

  toggleSubtask: (taskId, subtaskId) => {
    const next = get().tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            subtasks: (t.subtasks || []).map((s) =>
              s.id === subtaskId ? { ...s, completed: !s.completed } : s
            ),
          }
        : t
    );

    set({ tasks: next });
    persistTasks(next);
  },

  // ---------------------------
  // Templates
  // ---------------------------
  addTemplate: (tm) => {
    const next = [...get().templates, tm];
    set({ templates: next });
    persistTemplates(next);
  },

  updateTemplate: (id, data) => {
    const next = get().templates.map((t) => {
      if (t.id !== id) return t;

      return {
        ...t,
        name: data.name ?? t.name,
        blueprint: {
          ...t.blueprint,
          priority: data.priority ?? t.blueprint.priority,
          notes: data.notes ?? t.blueprint.notes,
          subtaskCount: data.subtaskCount ?? t.blueprint.subtaskCount,
          subtaskNames: data.subtaskNames ?? t.blueprint.subtaskNames,
        },
      };
    });

    set({ templates: next });
    persistTemplates(next);
  },

  removeTemplate: (id, options = { removeAssociatedTasks: false }) => {
    const nextTemplates = get().templates.filter((t) => t.id !== id);
    set({ templates: nextTemplates });
    persistTemplates(nextTemplates);

    if (options.removeAssociatedTasks) {
      const tasks = get().tasks;
      const filtered = tasks.filter(
        (task) => (task as any).originTemplateId !== id
      );

      tasks
        .filter((task) => (task as any).originTemplateId === id)
        .forEach((t) => {
          if (reminderTimers[t.id]) {
            clearTimeout(reminderTimers[t.id]);
            delete reminderTimers[t.id];
          }
        });

      set({ tasks: filtered });
      persistTasks(filtered);
    }
  },

  // ---------------------------
  // Apply Template (BLUEPRINT SYSTEM)
  // ---------------------------
  applyTemplate: (id, projectId) => {
    const tm = get().templates.find((t) => t.id === id);
    if (!tm) return;

    const bp = tm.blueprint;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: tm.name,
      createdAt: Date.now(),
      completed: false,
      projectId,

      priority: bp.priority,
      notes: bp.notes,

      subtasks: Array.from({ length: bp.subtaskCount }).map((_, i) => ({
        id: crypto.randomUUID(),
        title: bp.subtaskNames[i] || `Subtask ${i + 1}`,
        completed: false,
      })),
    };

    const next = [...get().tasks, newTask];

    set({ tasks: next });
    persistTasks(next);

    scheduleReminder(newTask);
  },

  // ---------------------------
  // Reminders
  // ---------------------------
  scheduleReminders: () => {
    get().tasks.forEach(scheduleReminder);
  },

  // ---------------------------
  // Stats
  // ---------------------------
  recordComplete: () => {
    const current = get().stats || {};
    const next = {
      ...current,
      completed: (current.completed || 0) + 1,
    };

    set({ stats: next });
    persistStats(next);
  },

  // ---------------------------
  // Reset All Data
  // ---------------------------
  clear: () => {
    Object.values(reminderTimers).forEach(clearTimeout);

    set({
      tasks: [],
      projects: [],
      templates: [],
      stats: {},
    });

    persistTasks([]);
    persistProjects([]);
    persistTemplates([]);
    persistStats({});
  },
}));
