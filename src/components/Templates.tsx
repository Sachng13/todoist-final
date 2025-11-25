import React, { useState } from "react";
import { useStore } from "../lib/store";
import { Template } from "../types";
import Modal from "./Modal";

export default function Templates() {
  const {
    templates,
    addTemplate,
    updateTemplate,
    applyTemplate,
    removeTemplate,
  } = useStore();

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);

  // Edit modal
  const [openEdit, setOpenEdit] = useState<Template | null>(null);

  // View expanded
  const [openView, setOpenView] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [notes, setNotes] = useState("");
  const [subCount, setSubCount] = useState(0);
  const [subNames, setSubNames] = useState<string[]>([]);

  /* -------------------------------------------------------- */
  /* Helpers                                                  */
  /* -------------------------------------------------------- */

  function resetForm() {
    setName("");
    setPriority("med");
    setNotes("");
    setSubCount(0);
    setSubNames([]);
  }

  function updateSubName(index: number, value: string) {
    setSubNames((prev) => {
      const arr = [...prev];
      arr[index] = value;
      return arr;
    });
  }

  function updateSubCount(n: number) {
    setSubCount(n);
    setSubNames((prev) => {
      const arr: string[] = [];
      for (let i = 0; i < n; i++) arr.push(prev[i] || "");
      return arr;
    });
  }

  /* -------------------------------------------------------- */
  /* Create Template                                          */
  /* -------------------------------------------------------- */

  function createTemplate() {
    if (!name.trim()) return;

    const tm: Template = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: Date.now(),
      blueprint: {
        priority,
        notes,
        subtaskCount: subCount,
        subtaskNames: subNames,
      },
    };

    addTemplate(tm);
    setOpenCreate(false);
    resetForm();
  }

  /* -------------------------------------------------------- */
  /* Edit Template                                            */
  /* -------------------------------------------------------- */

  function startEdit(t: Template) {
    setOpenEdit(t);

    setName(t.name);
    setPriority(t.blueprint.priority);
    setNotes(t.blueprint.notes);
    setSubCount(t.blueprint.subtaskCount);
    setSubNames(t.blueprint.subtaskNames);
  }

  function saveEdit() {
    if (!openEdit) return;

    updateTemplate(openEdit.id, {
      name,
      priority,
      notes,
      subtaskCount: subCount,
      subtaskNames: subNames,
    });

    setOpenEdit(null);
    resetForm();
  }

  /* -------------------------------------------------------- */
  /* UI                                                       */
  /* -------------------------------------------------------- */

  return (
    <div className="p-3 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Templates</h3>

        <button
          onClick={() => setOpenCreate(true)}
          className="px-3 py-1 bg-[#ef5350] text-white rounded"
        >
          New Template
        </button>
      </div>

      {/* Template List */}
      <div className="space-y-3 mt-4">
        {templates.map((t) => (
          <div key={t.id} className="border rounded bg-gray-50 p-2">
            <div className="flex justify-between items-center">
              <div className="font-medium">{t.name}</div>

              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => applyTemplate(t.id)}
                  className="text-blue-500"
                >
                  Apply
                </button>

                <button onClick={() => startEdit(t)} className="text-green-600">
                  Edit
                </button>

                <button
                  onClick={() => setOpenView(openView === t.id ? null : t.id)}
                  className="text-gray-500"
                >
                  View
                </button>

                <button
                  className="text-red-500"
                  onClick={() => removeTemplate(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Expanded "View" */}
            {openView === t.id && (
              <div className="pl-3 mt-2 text-sm text-gray-700">
                <div>Priority: {t.blueprint.priority}</div>
                {t.blueprint.notes && <div>Notes: {t.blueprint.notes}</div>}
                <div>Subtasks: {t.blueprint.subtaskCount}</div>

                {t.blueprint.subtaskCount > 0 && (
                  <div className="ml-4 mt-1">
                    {t.blueprint.subtaskNames.map((s, i) => (
                      <div key={i}>- {s || `Subtask ${i + 1}`}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* CREATE MODAL                                         */}
      {/* ---------------------------------------------------- */}
      {openCreate && (
        <Modal onClose={() => setOpenCreate(false)}>
          <div className="text-lg font-semibold mb-3">Create Template</div>

          <TemplateForm
            name={name}
            setName={setName}
            priority={priority}
            setPriority={setPriority}
            notes={notes}
            setNotes={setNotes}
            subCount={subCount}
            setSubCount={updateSubCount}
            subNames={subNames}
            updateSubName={updateSubName}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setOpenCreate(false)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              onClick={createTemplate}
              className="px-3 py-1 bg-[#ef5350] text-white rounded"
            >
              Create
            </button>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* EDIT MODAL                                           */}
      {/* ---------------------------------------------------- */}
      {openEdit && (
        <Modal onClose={() => setOpenEdit(null)}>
          <div className="text-lg font-semibold mb-3">
            Edit Template — {openEdit.name}
          </div>

          <TemplateForm
            name={name}
            setName={setName}
            priority={priority}
            setPriority={setPriority}
            notes={notes}
            setNotes={setNotes}
            subCount={subCount}
            setSubCount={updateSubCount}
            subNames={subNames}
            updateSubName={updateSubName}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setOpenEdit(null)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>

            <button
              onClick={saveEdit}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ====================================================================== */
/* TEMPLATE FORM — used by Create + Edit                                  */
/* ====================================================================== */

function TemplateForm({
  name,
  setName,
  priority,
  setPriority,
  notes,
  setNotes,
  subCount,
  setSubCount,
  subNames,
  updateSubName,
}: any) {
  return (
    <>
      <div className="mb-3">
        <label className="font-medium text-sm">Template Name</label>
        <input
          className="w-full border p-2 rounded mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="font-medium text-sm">Priority</label>
        <select
          className="w-full border p-2 rounded mt-1"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="med">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="font-medium text-sm">Notes</label>
        <textarea
          className="w-full border p-2 rounded mt-1"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="font-medium text-sm">Number of Subtasks</label>
        <input
          type="number"
          min={0}
          className="w-full border p-2 rounded mt-1"
          value={subCount}
          onChange={(e) => setSubCount(Number(e.target.value))}
        />
      </div>

      {subCount > 0 && (
        <div>
          <label className="font-medium text-sm">Subtask Names</label>

          <div className="mt-2 space-y-2 max-h-40 overflow-auto">
            {subNames.map((nm: string, i: number) => (
              <input
                key={i}
                value={nm}
                placeholder={`Subtask ${i + 1}`}
                onChange={(e) => updateSubName(i, e.target.value)}
                className="w-full border p-2 rounded"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
