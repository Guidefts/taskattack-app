import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Calendar, X } from 'lucide-react';
import { Header } from '../components/Header';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export function Progress() {
  const { homeTasks, allTasks } = useTaskStore();
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  const tasksInRange = [...homeTasks, ...allTasks].filter(task => {
    const taskDate = parseISO(task.date);
    const startDate = parseISO(dateRange.start);
    const endDate = parseISO(dateRange.end);
    return isWithinInterval(taskDate, {
      start: startOfDay(startDate),
      end: endOfDay(endDate)
    });
  });

  const completedTasks = tasksInRange.filter(task => task.completed).length;
  const totalTasks = tasksInRange.length;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getProgressColor = (score: number) => {
    if (score <= 40) return '#EF442D';
    if (score <= 80) return '#FFA34E';
    return '#C0F433';
  };

  const progressColor = getProgressColor(productivityScore);

  const formatDateRange = () => {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd')}`;
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <div className="content-wrapper">
        <Header />
        <h2 className="text-4xl font-bold mb-8 text-[#666666]">Productivity</h2>
        
        <div className="bg-[#EDEBE6] rounded-xl p-6 sm:p-8 text-[#232223]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[#666666] text-base sm:text-lg">Range</div>
            <button
              onClick={() => setShowDateModal(true)}
              className="flex items-center gap-2 text-base sm:text-lg text-black hover:opacity-80"
            >
              {formatDateRange()} <Calendar size={20} />
            </button>
          </div>
          
          <hr className="border-[#232223]/10 mb-6" />
          
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="flex items-center gap-2">
              <div className="text-[56px] sm:text-[64px] font-bold leading-none">{totalTasks}</div>
              <div className="text-[#666666] text-base sm:text-lg leading-tight">
                Total<br />
                Tasks
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[56px] sm:text-[64px] font-bold leading-none">{completedTasks}</div>
              <div className="text-[#666666] text-base sm:text-lg leading-tight">
                Tasks<br />
                Completed
              </div>
            </div>
          </div>

          <div className="bg-[#D9D7D2] rounded-xl overflow-hidden relative h-[250px] sm:h-[312px]">
            <div 
              className="absolute inset-0 transition-all duration-1000 ease-out"
              style={{
                height: `${productivityScore}%`,
                backgroundColor: progressColor,
                top: 'auto'
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[84px] sm:text-[96px] font-bold text-[#232223]">
                {productivityScore}%
              </div>
              <div className="text-center text-base sm:text-lg text-[#232223] mt-2">
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
              <h3 className="text-2xl font-bold text-[#232223]">Select Date Range</h3>
              <button 
                onClick={() => setShowDateModal(false)}
                className="p-2 hover:bg-black/10 rounded-lg"
              >
                <X size={20} className="text-[#232223]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#666666] mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm text-[#666666] mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300"
                />
              </div>

              <button
                onClick={() => setShowDateModal(false)}
                className="w-full bg-[#232223] text-white py-3 rounded-lg font-medium mt-4"
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