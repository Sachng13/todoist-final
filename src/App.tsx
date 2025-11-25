import React, { useEffect, useState } from "react";
import { useStore } from "./lib/store";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TaskList from "./components/TaskList";
import VoiceAdd from "./components/VoiceAdd";
import Templates from "./components/Templates";
import FocusPanel from "./components/FocusPanel";
import { exportAll, importAll } from "./lib/storage";
import { Task } from "./types";

export default function App() {
  const { tasks, load, initLoaded, addTask, templates } = useStore();
  const [selectedProject, setSelectedProject] = useState<string | undefined>(
    undefined
  );
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState<"low" | "med" | "high">("low");
  const [query, setQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  if (!initLoaded) return <div className="p-10 text-center">Loading...</div>;

  const visible = tasks
    .filter((t) => t.projectId === selectedProject)
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  function voiceSubmit(text: string) {
    // basic quick-add parsing: "[title] tomorrow" => due date if word tomorrow
    let dueDate;
    if (text.toLowerCase().includes("tomorrow")) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      dueDate = d.toISOString().split("T")[0];
    }
    const t: Task = {
      id: crypto.randomUUID(),
      title: text,
      completed: false,
      createdAt: Date.now(),
      dueDate,
      priority: "low",
      projectId: selectedProject,
      order: visible.length,
      subtasks: [],
    };
    addTask(t);
  }

  async function handleAdd() {
    if (!title.trim()) return;
    const t: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now(),
      dueDate: due || undefined,
      priority,
      projectId: selectedProject,
      order: visible.length,
      subtasks: [],
    };
    addTask(t);
    setTitle("");
    setDue("");
    setPriority("low");
  }

  async function handleExport() {
    const json = await exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "todoist-final.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async (e: any) => {
      const f = e.target.files[0];
      if (!f) return;
      const txt = await f.text();
      await importAll(txt);
      window.location.reload();
    };
    input.click();
  }

  return (
    <div className="max-h-screen">
      <Header
        onExport={handleExport}
        onImport={handleImport}
        onNew={() => {
          const el = document.getElementById(
            "new-title"
          ) as HTMLInputElement | null;
          el?.focus();
        }}
      />
      <div className="max-w-6xl mx-auto flex gap-6 p-6">
        <div className="w-72 shrink-0">
          <Sidebar selected={selectedProject} onSelect={setSelectedProject} />
        </div>
        <div className="flex-1">
          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                id="new-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a task..."
                className="border p-2 col-span-2"
              />
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="border p-2"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="border p-2"
              >
                <option value="low">Low</option>
                <option value="med">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={handleAdd}
                className="bg-[#ef5350] text-white px-4 py-2 rounded"
              >
                Add Task
              </button>
              <input
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border p-2 flex-1"
              />
              <VoiceAdd onSubmit={(txt: string) => setTitle(txt)} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-2">
              {visible.length === 0 ? (
                <div className="p-6 bg-white rounded shadow">
                  No tasks — add one to get started.
                </div>
              ) : (
                <TaskList projectId={selectedProject} />
              )}
            </div>
            <div className="space-y-1">
              <Templates />
              <FocusPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
