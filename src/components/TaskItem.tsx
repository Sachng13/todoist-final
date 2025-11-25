import React, { useState, useEffect } from "react";
import { Task, Priority } from "../types";
import { useStore } from "../lib/store";
import clsx from "clsx";
import Modal from "./Modal";

export default function TaskItem({ task }: { task: Task }) {
  const { toggleTask, removeTask, addSubtask, toggleSubtask, updateTask } =
    useStore();

  // Add subtask (outside modal)
  const [newSub, setNewSub] = useState("");

  // Modal state
  const [editing, setEditing] = useState(false);

  // Modal fields
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || "");
  const [editNotes, setEditNotes] = useState(task.notes || "");
  const [editSubtasks, setEditSubtasks] = useState(
    task.subtasks ? [...task.subtasks] : []
  );

  // ---------------------------------------------------------
  // Sync modal values EVERY TIME modal opens or task updates
  // ---------------------------------------------------------
  useEffect(() => {
    if (!editing) return;

    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || "");
    setEditNotes(task.notes || "");
    setEditSubtasks(task.subtasks ? [...task.subtasks] : []);
  }, [editing, task]);

  // Add subtask outside modal
  function addSub(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!newSub.trim()) return;

    addSubtask(task.id, {
      id: crypto.randomUUID(),
      title: newSub.trim(),
      completed: false,
    });

    setNewSub("");
  }

  function quickRem(e: React.MouseEvent, ms: number) {
    e.stopPropagation();
    const at = Date.now() + ms;
    updateTask(task.id, { reminderAt: at });
    if (Notification.permission !== "granted") Notification.requestPermission();
    alert("Reminder set");
  }

  // Save modal edits
  function saveEdit() {
    updateTask(task.id, {
      title: editTitle.trim(),
      priority: editPriority,
      dueDate: editDueDate,
      notes: editNotes,
      subtasks: editSubtasks.map((s) => ({
        ...s,
        title: s.title || "",
      })),
    });

    setEditing(false);
  }

  return (
    <>
      {/* =================================================== */}
      {/* READ MODE                                           */}
      {/* =================================================== */}
      <div
        className={clsx(
          "task-card p-3 rounded shadow-sm",
          "priority-" + (task.priority || "low")
        )}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => {
              e.stopPropagation();
              toggleTask(task.id);
            }}
          />

          <div className="flex-1">
            <div
              className={
                task.completed ? "line-through text-gray-400" : "font-medium"
              }
            >
              {task.title}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {task.dueDate && (
                <span
                  className={
                    task.dueDate < new Date().toISOString().split("T")[0]
                      ? "text-red-500"
                      : ""
                  }
                >
                  Due: {task.dueDate} •{" "}
                </span>
              )}
              Priority: {task.priority}
            </div>

            {task.notes && (
              <div className="mt-2 text-sm text-gray-700">{task.notes}</div>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
              className="text-blue-500"
            >
              Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTask(task.id);
              }}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Subtasks */}
        <div className="mt-3">
          {(task.subtasks || []).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={s.completed}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleSubtask(task.id, s.id)}
              />
              <div className={s.completed ? "line-through text-gray-500" : ""}>
                {s.title}
              </div>
            </div>
          ))}

          {/* Add new subtask */}
          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <input
              value={newSub}
              onChange={(e) => setNewSub(e.target.value)}
              placeholder="Add subtask"
              className="border p-1 flex-1 text-sm"
            />
            <button
              onClick={addSub}
              className="px-2 bg-[#ef5350] text-white rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>

        {/* Quick reminders */}
        <div className="mt-3 flex gap-2 text-xs">
          <button
            onClick={(e) => quickRem(e, 5 * 60 * 1000)}
            className="bg-yellow-100 px-2 py-1 rounded"
          >
            Remind 5m
          </button>
          <button
            onClick={(e) => quickRem(e, 60 * 60 * 1000)}
            className="bg-yellow-100 px-2 py-1 rounded"
          >
            1h
          </button>
        </div>
      </div>

      {/* =================================================== */}
      {/* MODAL EDITOR                                        */}
      {/* =================================================== */}
      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <div className="text-lg font-semibold mb-3">Edit Task</div>

          {/* Title */}
          <div className="mb-3">
            <label className="text-sm font-medium">Title</label>
            <input
              className="border p-2 w-full rounded mt-1"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="mb-3">
            <label className="text-sm font-medium">Priority</label>
            <select
              className="border p-2 w-full rounded mt-1"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="med">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="mb-3">
            <label className="text-sm font-medium">Due Date</label>
            <input
              type="date"
              className="border p-2 w-full rounded mt-1"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="mb-3">
            <label className="text-sm font-medium">Notes</label>
            <textarea
              className="border p-2 w-full rounded mt-1"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Subtasks */}
          <div className="mb-3">
            <label className="text-sm font-medium">Subtasks</label>

            <div className="space-y-2 mt-2">
              {editSubtasks.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <input
                    className="border p-2 flex-1 rounded"
                    value={s.title}
                    onChange={(e) => {
                      const arr = [...editSubtasks];
                      arr[i].title = e.target.value;
                      setEditSubtasks(arr);
                    }}
                  />
                  <button
                    className="text-red-500 text-sm"
                    onClick={() =>
                      setEditSubtasks((arr) => arr.filter((x) => x.id !== s.id))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                setEditSubtasks((arr) => [
                  ...arr,
                  {
                    id: crypto.randomUUID(),
                    title: "",
                    completed: false,
                  },
                ])
              }
              className="text-blue-600 text-sm mt-2"
            >
              + Add Subtask
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>

            <button
              onClick={saveEdit}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
