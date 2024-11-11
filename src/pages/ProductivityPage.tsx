import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Calendar, X } from 'lucide-react';
import { Header } from '../components/Header';

export function ProductivityPage() {
  const { homeTasks, allTasks } = useTaskStore();
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  // Get all tasks within the date range from both lists
  const tasksInRange = [...homeTasks, ...allTasks].filter(task => {
    const taskDate = new Date(task.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return taskDate >= startDate && taskDate <= endDate;
  });

  // Count completed tasks
  const completedTasks = tasksInRange.filter(task => task.completed).length;
  // Total tasks is all tasks in range
  const totalTasks = tasksInRange.length;
  // Calculate productivity percentage
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getProgressColor = (score: number) => {
    if (score <= 40) return '#EF442D';
    if (score <= 80) return '#FFA34E';
    return '#C0F433';
  };

  const progressColor = getProgressColor(productivityScore);

  const formatDateRange = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return `${start.toLocaleDateString('en-US', { month: 'short' })} - ${end.toLocaleDateString('en-US', { month: 'short' })}`;
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-3xl mx-auto">
        <Header showSubtitle={false} />
        
        <div className="bg-[#EDEBE6] rounded-xl p-6 sm:p-8 text-black mt-8">
          <h2 className="text-[32px] sm:text-[40px] font-bold mb-6">Productivity</h2>
          
          <hr className="border-black/10 mb-8" />
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-[48px] sm:text-[64px] font-bold leading-none">{completedTasks}</div>
              <div className="text-[#666666] text-base sm:text-lg">
                Tasks<br />Completed
              </div>
            </div>
            <div>
              <div className="text-[48px] sm:text-[64px] font-bold leading-none">{totalTasks}</div>
              <div className="text-[#666666] text-base sm:text-lg">
                Total of<br />Tasks
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-[#666666] text-base sm:text-lg mb-2">Range</div>
            <button
              onClick={() => setShowDateModal(true)}
              className="flex items-center gap-2 text-base sm:text-lg text-black hover:opacity-80 w-full"
            >
              {formatDateRange()} <Calendar size={20} />
            </button>
          </div>

          <div className="bg-[#D9D7D2] rounded-xl p-6 sm:p-8 relative min-h-[300px] sm:min-h-[200px]">
            <div 
              className="absolute bottom-0 left-0 w-full transition-all duration-1000 ease-out rounded-b-xl"
              style={{
                height: `${productivityScore}%`,
                backgroundColor: progressColor,
                opacity: 1,
              }}
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <div className="text-[64px] sm:text-[96px] font-bold mb-2 text-black opacity-100">
                {productivityScore}%
              </div>
              <div className="text-center text-base sm:text-lg text-black opacity-100">
                Completed on time
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDateModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowDateModal(false)}
        >
          <div className="bg-[#EDEBE6] rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-black">Select Date Range</h3>
              <button 
                onClick={() => setShowDateModal(false)}
                className="p-2 hover:bg-black/10 rounded-lg"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

              <button
                onClick={() => setShowDateModal(false)}
                className="w-full bg-black text-white py-3 rounded-lg font-medium mt-4"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}