import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Project } from '../types';
export default function Sidebar({ selected, onSelect }: any) {
  const { projects, addProject, tasks, removeProject } = useStore();
  const [name, setName] = useState('');
  function create(){ if(!name.trim()) return; const p:Project = { id: crypto.randomUUID(), name: name.trim(), createdAt: Date.now() }; addProject(p); setName(''); }
  const inboxCount = tasks.filter((t:any)=> !t.projectId).length;
  return (
    <aside className="sidebar h-screen p-4 sticky top-0">
      <div className="mb-4">
        <div className={"p-2 rounded cursor-pointer "+(!selected ? "bg-[#fff3f3]" : "") } onClick={()=>onSelect(undefined)}>
          <div className="flex justify-between items-center"><div>Inbox</div><div className="text-xs text-gray-500">{inboxCount}</div></div>
        </div>
      </div>
      <div className="mb-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New project" className="border p-2 w-full" />
        <button onClick={create} className="mt-2 w-full bg-[#ef5350] text-white py-1 rounded">Create</button>
      </div>
      <div className="space-y-2">
        {projects.map((p:any)=> {
          const count = tasks.filter((t:any)=> t.projectId === p.id).length;
          return (
            <div key={p.id} className={"p-2 mt-2 rounded flex justify-between items-center "+(selected===p.id ? "bg-[#fff3f3]" : "")}>
              <div onClick={()=>onSelect(p.id)} className="cursor-pointer">{p.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <div>{count}</div>
                <button onClick={(e)=>{ e.stopPropagation(); removeProject(p.id); }} className="text-red-500">X</button>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  );
}
