import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { TaskList } from '../components/TaskList';
import { Header } from '../components/Header';
import { Task } from '../types/Task';
import { AlertCircle, Circle } from 'lucide-react';

export function TaskListPage() {
  const { allTasks, addTask, updateTask, deleteTask, moveTaskToHome, reorderTasks } = useTaskStore();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      if (id === 'new') {
        await addTask({
          ...updates,
          featured: false,
        });
      } else {
        await updateTask(id, updates);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error updating task:', error);
    }
  };

  const handleFeature = async (taskId: string) => {
    try {
      setError(null);
      await moveTaskToHome(taskId);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to feature task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      setError(null);
      await deleteTask(taskId);
    } catch (error: any) {
      setError(error.message);
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <div className="content-wrapper">
        <Header />
        
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold text-[#666666]">Task Bucket</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Circle size={12} className="text-[#FFD84E] fill-[#FFD84E]" />
              <span className="text-sm text-gray-400">Work</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle size={12} className="text-[#C9C9C9] fill-[#C9C9C9]" />
              <span className="text-sm text-gray-400">Personal</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <TaskList 
          tasks={allTasks}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onFeature={handleFeature}
          showFeatureButton
          onReorder={reorderTasks}
        />
      </div>
    </div>
  );
}