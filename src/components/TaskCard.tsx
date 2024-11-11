import React, { useState } from 'react';
import { Task } from '../types/Task';
import { Check, Trash2, Edit2, X, GripVertical, Star, MoreVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskStore } from '../store/taskStore';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  showFeatureButton?: boolean;
  onFeature?: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onUpdate, onDelete, showFeatureButton, onFeature, isDragging }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [editedTask, setEditedTask] = useState({
    ...task,
    date: format(new Date(task.date), 'yyyy-MM-dd')
  });
  const { groups } = useTaskStore();

  const getBorderColor = () => {
    if (task.completed) return '#C0F433';
    return task.group === 'Work' ? '#FFD84E' : '#C9C9C9';
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderColor: getBorderColor(),
    opacity: isDragging || isSortableDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? 'relative' : undefined,
    backgroundColor: isDragging ? 'var(--color-surface-light)' : undefined,
    cursor: isDragging ? 'grabbing' : undefined,
  };

  const handleSave = async () => {
    if (editedTask.title.trim()) {
      try {
        await onUpdate(task.id, {
          title: editedTask.title.trim(),
          description: editedTask.description?.trim() || '',
          group: editedTask.group,
          date: editedTask.date
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }
  };

  const TaskOptions = () => (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => setShowOptions(false)}>
      <div className="bg-surface w-full sm:w-96 rounded-t-xl sm:rounded-xl p-4 m-4 space-y-2 text-white">
        {showFeatureButton && onFeature && !task.completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFeature(task.id);
              setShowOptions(false);
            }}
            className="w-full p-3 rounded-lg hover:bg-surface-light flex items-center gap-2"
          >
            <Star size={20} className={task.featured ? "text-[#FFD700]" : "text-gray-400"} />
            <span>{task.featured ? 'Remove from Featured' : 'Add to Featured'}</span>
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setShowOptions(false);
          }}
          className="w-full p-3 rounded-lg hover:bg-surface-light flex items-center gap-2"
        >
          <Edit2 size={20} className="text-gray-400" />
          <span>Edit Task</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
            setShowOptions(false);
          }}
          className="w-full p-3 rounded-lg hover:bg-surface-light flex items-center gap-2 text-red-500"
        >
          <Trash2 size={20} />
          <span>Delete Task</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(false);
          }}
          className="w-full p-3 rounded-lg hover:bg-surface-light text-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const getEditFieldClasses = () => {
    const baseClasses = "w-full p-2 rounded-lg";
    if (task.completed) {
      return `${baseClasses} bg-[#ACD834] text-[#1A1A1A] placeholder-[#1A1A1A]/50`;
    }
    return `${baseClasses} bg-surface-light text-white placeholder-white/50`;
  };

  const getEditLabelClasses = () => {
    if (task.completed) {
      return "block text-sm text-[#1A1A1A] mb-1";
    }
    return "block text-sm text-gray-400 mb-1";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card px-3 py-4 rounded-xl border ${
        task.completed ? 'bg-[#C0F433] text-[#232223]' : 'bg-surface text-white'
      }`}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-4">
              <label className={getEditLabelClasses()}>Title</label>
              <input
                type="text"
                value={editedTask.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className={getEditFieldClasses()}
                placeholder="Task title"
                autoFocus
                maxLength={100}
              />
            </div>
            <div className="flex-1">
              <label className={getEditLabelClasses()}>Group</label>
              <select
                value={editedTask.group}
                onChange={(e) => setEditedTask({ ...editedTask, group: e.target.value })}
                className={`${getEditFieldClasses()} appearance-none`}
                required
              >
                <option value="" className={task.completed ? "text-[#1A1A1A]" : "text-white"}>Select a group</option>
                {groups.map((group) => (
                  <option 
                    key={group} 
                    value={group} 
                    className={task.completed ? "text-[#1A1A1A]" : "text-white"}
                  >
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={getEditLabelClasses()}>Due Date</label>
            <input
              type="date"
              value={editedTask.date}
              onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
              className={getEditFieldClasses()}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className={getEditLabelClasses()}>Description</label>
            <textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className={`${getEditFieldClasses()} h-32 resize-none`}
              rows={3}
              placeholder="Task description (optional)"
              maxLength={500}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedTask({
                  ...task,
                  date: format(new Date(task.date), 'yyyy-MM-dd')
                });
              }}
              className={`px-4 py-2 rounded ${
                task.completed 
                  ? 'bg-[#1A1A1A] text-white hover:bg-opacity-90'
                  : 'bg-surface-light hover:bg-opacity-80 text-white'
              } flex items-center gap-2`}
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                task.completed
                  ? 'bg-[#1A1A1A] text-white hover:bg-opacity-90'
                  : 'bg-[#EF442D] text-[#232223] hover:bg-opacity-90'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="mt-1 cursor-grab touch-manipulation"
          >
            <GripVertical size={16} className={task.completed ? 'text-[#232223]' : 'text-gray-500'} />
          </div>
          
          <button
            onClick={() => onUpdate(task.id, { completed: !task.completed })}
            className={`mt-1 w-5 h-5 rounded flex items-center justify-center transition-colors ${
              task.completed 
                ? 'bg-[#232223]' 
                : 'border-2 border-gray-600 hover:border-[#C0F433]'
            }`}
          >
            {task.completed && <Check size={14} className="text-[#C0F433]" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <h3 className={`task-title font-medium text-sm sm:text-base ${task.completed ? 'line-through opacity-70' : ''}`}>
                {task.title}
              </h3>
              <button
                onClick={() => setShowOptions(true)}
                className="p-1.5 rounded-lg hover:bg-surface-light ml-2"
              >
                <MoreVertical size={16} className={task.completed ? 'text-[#232223]' : 'text-gray-400'} />
              </button>
            </div>
            {task.description && (
              <p className={`text-sm whitespace-pre-wrap ${
                task.completed ? 'opacity-70' : 'text-gray-300'
              }`}>
                {task.description}
              </p>
            )}
          </div>
        </div>
      )}
      {showOptions && <TaskOptions />}
    </div>
  );
}