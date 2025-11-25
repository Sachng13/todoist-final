import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '../lib/store';
import SortableTask from './SortableTask';

export default function TaskList({ projectId }: { projectId?: string }) {
  const { tasks, reorderTasks } = useStore();
  const list = tasks.filter(t => t.projectId === projectId).sort((a,b)=> (a.order ?? 0) - (b.order ?? 0));

  function handleDragEnd(event:any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = list.findIndex((t)=>t.id===active.id);
    const newIndex = list.findIndex((t)=>t.id===over.id);
    const newList = arrayMove(list, oldIndex, newIndex);
    const orderedIds = newList.map(t=>t.id);
    reorderTasks(projectId, orderedIds);
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={list.map(l=>l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {list.map(t=> <SortableTask key={t.id} task={t} />)}
        </div>
      </SortableContext>
    </DndContext>
  );
}
