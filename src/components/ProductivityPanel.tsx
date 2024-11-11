import React from 'react';
import { Task } from '../types/Task';
import { CheckCircle2, ListTodo, Percent } from 'lucide-react';

interface ProductivityPanelProps {
  tasks: Task[];
}

export function ProductivityPanel({ tasks }: ProductivityPanelProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-surface rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-6">Today's Progress</h2>
      <div className="grid grid-cols-3 gap-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <CheckCircle2 size={24} className="text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <ListTodo size={24} className="text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C0F433]/10 rounded-lg">
            <Percent size={24} className="text-[#C0F433]" />
          </div>
          <div>
            <div className="text-2xl font-bold">{productivityScore}%</div>
            <div className="text-sm text-gray-400">Completion</div>
          </div>
        </div>
      </div>
    </div>
  );
}