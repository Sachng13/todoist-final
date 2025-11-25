import React from "react";
export default function Header({ onExport, onImport, onNew }: any) {
  return (
    <div className="header p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#ef5350] flex items-center justify-center text-white font-bold">
          T
        </div>
        <div>
          <div className="text-sm text-gray-600">Workspace</div>
          <div className="font-semibold">Sachin</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNew}
          title="New task (n)"
          className="px-3 py-1 bg-[#ef5350] text-white rounded"
        >
          New (n)
        </button>
        <button
          onClick={onExport}
          className="px-3 py-1 bg-white border rounded"
        >
          Export
        </button>
        <button
          onClick={onImport}
          className="px-3 py-1 bg-white border rounded"
        >
          Import
        </button>
      </div>
    </div>
  );
}
