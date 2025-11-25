import localforage from 'localforage';
import { Task, Project, Template } from '../types';
const K_T = 'tf_tasks_v1', K_P='tf_projects_v1', K_TM='tf_templates_v1', K_STATS='tf_stats_v1';
export async function loadTasks(): Promise<Task[]> { return (await localforage.getItem<Task[]>(K_T)) || []; }
export async function persistTasks(tasks:Task[]){ await localforage.setItem(K_T, tasks); }
export async function loadProjects(): Promise<Project[]>{ return (await localforage.getItem<Project[]>(K_P)) || []; }
export async function persistProjects(projects:Project[]){ await localforage.setItem(K_P, projects); }
export async function loadTemplates(): Promise<Template[]>{ return (await localforage.getItem<Template[]>(K_TM)) || []; }
export async function persistTemplates(templates:Template[]){ await localforage.setItem(K_TM, templates); }
export async function loadStats(){ return (await localforage.getItem<any>(K_STATS)) || {}; }
export async function persistStats(s:any){ await localforage.setItem(K_STATS, s); }
export async function exportAll(){ const [t,p,tm,st] = await Promise.all([loadTasks(),loadProjects(),loadTemplates(),loadStats()]); return JSON.stringify({tasks:t,projects:p,templates:tm,stats:st},null,2); }
export async function importAll(j:string){ const parsed = JSON.parse(j); if(parsed.tasks) await persistTasks(parsed.tasks); if(parsed.projects) await persistProjects(parsed.projects); if(parsed.templates) await persistTemplates(parsed.templates); if(parsed.stats) await persistStats(parsed.stats); }
