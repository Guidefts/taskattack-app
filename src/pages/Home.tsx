import React, { useState } from 'react';
import { Header } from '../components/Header';
import { TaskList } from '../components/TaskList';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types/Task';
import { Circle } from 'lucide-react';

export function Home() {
  const { homeTasks, addTask, updateTask, deleteTask, moveTaskToAll, reorderTasks } = useTaskStore();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      if (id === 'new') {
        await addTask({
          ...updates,
          featured: true,
        });
      } else {
        await updateTask(id, updates);
        if (updates.completed) {
          await moveTaskToAll(id);
        }
      }
    } catch (error: any) {
      console.error('Error updating task:', error);
      setError(error.message);
    }
  };

  const handleReorder = async (tasks: Task[]) => {
    try {
      setError(null);
      await reorderTasks(tasks);
    } catch (error: any) {
      console.error('Error reordering tasks:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <div className="content-wrapper">
        <Header />
        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-bold text-[#666666]">The Three Mode</h2>
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
        
        <div className="mt-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <TaskList 
            tasks={homeTasks}
            onUpdate={handleUpdate}
            onDelete={deleteTask}
            onReorder={handleReorder}
            maxTasks={3}
          />
        </div>
      </div>
    </div>
  );
}