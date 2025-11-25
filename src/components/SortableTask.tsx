import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "./TaskItem";
import { Task } from "../types";

export default function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "manipulation",
    pointerEvents: "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-start gap-2">
        {/* LEFT drag handle */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing px-1 py-2 text-gray-400 select-none"
        >
          ⠿
        </div>

        {/* Actual task card */}
        <div className="flex-1">
          <TaskItem task={task} />
        </div>
      </div>
    </div>
  );
}
