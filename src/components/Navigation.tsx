import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { List, Target, Plus, User, BarChart2 } from 'lucide-react';
import { NewTaskModal } from './NewTaskModal';
import { useTaskStore } from '../store/taskStore';

export function Navigation() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const { addTask } = useTaskStore();

  const handleAddTask = async (taskData: any) => {
    try {
      await addTask({
        ...taskData,
        completed: false,
        createdAt: Date.now()
      });
      setShowNewTaskModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-gray-800 z-50">
        <div className="nav-wrapper">
          <div className="flex justify-between items-center py-3">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="p-3 rounded-full bg-[#EF442D] text-[#232223] transform hover:scale-105 transition-transform"
            >
              <Plus size={24} />
            </button>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `p-3 rounded-full ${isActive ? 'text-[#EF442D]' : 'text-gray-400'}`
              }
            >
              <span className="font-bold text-xl">3</span>
            </NavLink>
            <NavLink 
              to="/tasks" 
              className={({ isActive }) => 
                `p-3 rounded-full ${isActive ? 'text-[#EF442D]' : 'text-gray-400'}`
              }
            >
              <List size={24} />
            </NavLink>
            <NavLink 
              to="/progress" 
              className={({ isActive }) => 
                `p-3 rounded-full ${isActive ? 'text-[#EF442D]' : 'text-gray-400'}`
              }
            >
              <Target size={24} />
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => 
                `p-3 rounded-full ${isActive ? 'text-[#EF442D]' : 'text-gray-400'}`
              }
            >
              <BarChart2 size={24} />
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => 
                `p-3 rounded-full ${isActive ? 'text-[#EF442D]' : 'text-gray-400'}`
              }
            >
              <User size={24} />
            </NavLink>
          </div>
        </div>
      </nav>

      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSubmit={handleAddTask}
        />
      )}
    </>
  );
}