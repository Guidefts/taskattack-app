import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Line, Doughnut } from 'react-chartjs-2';
import { format, subDays, addDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const categoryColors = {
  Work: '#FFD84E',
  Personal: '#C9C9C9',
};

const getTaskStats = (tasks: any[]) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  const byCategory = tasks.reduce((acc: { [key: string]: number }, task) => {
    const category = task.group || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(subDays(today, 4), i);
    const tasksForDay = tasks.filter(task => {
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, {
        start: startOfDay(date),
        end: endOfDay(date)
      });
    });
    const dayCompleted = tasksForDay.filter(t => t.completed).length;
    const dayTotal = tasksForDay.length;
    return {
      date: format(date, 'MMM dd'),
      completionRate: dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0
    };
  });

  return {
    total,
    completed,
    completionRate,
    byCategory,
    trend: days
  };
};

export function Analytics() {
  const { homeTasks, allTasks, initialize } = useTaskStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const allTasksList = [...homeTasks, ...allTasks];
    setStats(getTaskStats(allTasksList));
  }, [homeTasks, allTasks]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const lineChartData = {
    labels: stats.trend.map((day: any) => day.date),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: stats.trend.map((day: any) => day.completionRate),
        borderColor: '#4E60FF',
        backgroundColor: 'rgba(78, 96, 255, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(stats.byCategory),
    datasets: [
      {
        data: Object.values(stats.byCategory),
        backgroundColor: Object.keys(stats.byCategory).map(category => categoryColors[category as keyof typeof categoryColors] || '#808080'),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <div className="content-wrapper">
        <Header />
        <h2 className="text-4xl font-bold mb-8 text-[#666666]">Analytics</h2>

        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6">Completion Rate Trend</h3>
            <div className="h-[300px]">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6">Tasks by Category</h3>
            <div className="h-[300px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl">
            <h3 className="text-xl font-semibold mb-6">Quick Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-background p-4 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-[#C9C9C9]">
                  {stats.completed}
                </div>
                <div className="text-sm text-gray-400">Total Completed</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-[#C9C9C9]">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-400">Total Tasks</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-[#C9C9C9]">
                  {Object.keys(stats.byCategory).length}
                </div>
                <div className="text-sm text-gray-400">Categories</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-[#C9C9C9]">
                  {Math.round(stats.completionRate)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}