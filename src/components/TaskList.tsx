import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Task } from '../types/Task';
import { Plus, AlertCircle } from 'lucide-react';
import { NewTaskModal } from './NewTaskModal';
import { useTaskStore } from '../store/taskStore';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onFeature?: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
  showFeatureButton?: boolean;
  maxTasks?: number;
}

export function TaskList({
  tasks = [],
  onUpdate,
  onDelete,
  onFeature,
  onReorder,
  showFeatureButton,
  maxTasks,
}: TaskListProps) {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { initialize, initialized } = useTaskStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newTasks = arrayMove([...tasks], oldIndex, newIndex);
        await onReorder(newTasks);
      }
    }
  };

  const handleNewTask = async (taskData: any) => {
    try {
      setError(null);
      const isFeatured = taskData.featured && (!maxTasks || tasks.length < maxTasks);
      await onUpdate('new', {
        ...taskData,
        featured: isFeatured,
        completed: false,
        createdAt: Date.now()
      });
      setShowNewTaskModal(false);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to create task:', error);
    }
  };

  const handleFeature = async (taskId: string) => {
    try {
      setError(null);
      if (onFeature) {
        await onFeature(taskId);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to feature task:', error);
    }
  };

  const displayTasks = maxTasks ? tasks.slice(0, maxTasks) : tasks;
  const activeTask = activeId ? tasks.find(task => task.id === activeId) : null;

  return (
    <>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={displayTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {displayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onFeature={handleFeature}
                  showFeatureButton={showFeatureButton}
                  isDragging={task.id === activeId}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={true}>
            {activeTask && (
              <TaskCard
                task={activeTask}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onFeature={handleFeature}
                showFeatureButton={showFeatureButton}
                isDragging={true}
              />
            )}
          </DragOverlay>
        </DndContext>

        {(!maxTasks || tasks.length < maxTasks) && (
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="w-full bg-surface hover:bg-surface-light rounded-xl p-6 flex items-center justify-center gap-2 text-gray-400 transition-colors mt-4"
          >
            <Plus size={20} />
            Add New Task
          </button>
        )}
      </div>

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={handleNewTask}
        />
      )}
    </>
  );
}