import React, { useState } from 'react';
import { X, ChevronDown, Calendar } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';

interface NewTaskModalProps {
  onClose: () => void;
  onSubmit: (task: {
    title: string;
    description: string;
    group: string;
    date: string;
    featured: boolean;
  }) => Promise<void>;
}

export function NewTaskModal({ onClose, onSubmit }: NewTaskModalProps) {
  const { groups } = useTaskStore();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    group: '',
    date: new Date().toISOString().split('T')[0],
    featured: false,
  });

  const steps = [
    { title: 'New Task', question: "What task are you ready to attack?" },
    { title: 'New Task', question: "Which group should this task go under?" },
    { title: 'New Task', question: "When's your target completion date?" },
    { title: 'New Task', question: "Give a quick description of the task or action needed." },
    { title: 'New Task', question: "Want to pin this task to the front page?" },
  ];

  const validateStep = (step: number): boolean => {
    setError('');

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError('Please enter a task title');
          return false;
        }
        break;
      case 2:
        if (!formData.group) {
          setError('Please select a group');
          return false;
        }
        break;
      case 3:
        if (!formData.date) {
          setError('Please select a date');
          return false;
        }
        break;
    }

    return true;
  };

  const handleNext = () => {
    if (!user) {
      setError('Please sign in to create tasks');
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async (featured: boolean) => {
    try {
      if (!user) {
        setError('Please sign in to create tasks');
        return;
      }

      if (!validateStep(currentStep)) {
        return;
      }

      setIsSubmitting(true);
      setError('');

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        group: formData.group,
        date: formData.date,
        featured,
      };

      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => {
    const totalSteps = steps.length;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="h-1 bg-[#232223]/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#232223] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const renderStepContent = () => {
    const inputBaseClasses = [
      "w-full",
      "p-4",
      "rounded-xl",
      "border-[1px]",
      "border-solid",
      "border-[#232223]",
      "text-[#232223]",
      "placeholder-[#232223]/50",
      "focus:outline-none",
      "bg-transparent"
    ].join(" ");

    switch (currentStep) {
      case 1:
        return (
          <div className="relative">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                setError('');
              }}
              className={inputBaseClasses}
              placeholder="Add Title"
              maxLength={100}
              autoFocus
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <select
              value={formData.group}
              onChange={(e) => {
                setFormData({ ...formData, group: e.target.value });
                setError('');
              }}
              className={`${inputBaseClasses} appearance-none text-[#232223]`}
              required
            >
              <option value="" className="text-[#232223]">Select Group</option>
              {groups.map((group) => (
                <option key={group} value={group} className="text-[#232223]">{group}</option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#232223] pointer-events-none" />
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value });
                setError('');
              }}
              className={`${inputBaseClasses} text-[#232223]`}
              required
            />
            <Calendar size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#232223] pointer-events-none" />
          </div>
        );
      case 4:
        return (
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              setError('');
            }}
            className={`${inputBaseClasses} h-32 resize-none text-[#232223]`}
            placeholder="Describe the task (optional)"
            maxLength={500}
          />
        );
      case 5:
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="flex-1 p-4 rounded-xl border-[1px] border-solid border-[#232223] bg-[#1A1A1A] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Yes, Pin It'}
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 p-4 rounded-xl border-[1px] border-solid border-[#232223] bg-[#1A1A1A] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'No, Thanks'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && !isSubmitting && onClose()}
    >
      <div className="bg-[#EDEBE6] rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 space-y-6">
          {renderProgressBar()}
          
          <div className="flex justify-between items-center">
            <h2 className="text-[40px] font-medium leading-none text-[#232223]">
              {steps[currentStep - 1].title}
            </h2>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-[#232223]/10 rounded-full disabled:opacity-50"
            >
              <X size={24} className="text-[#232223]" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[#232223] text-lg">{steps[currentStep - 1].question}</p>
            {renderStepContent()}
          </div>

          {error && (
            <div className="text-[#EF442D] text-sm">
              {error}
            </div>
          )}

          {currentStep < steps.length && (
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="w-full p-4 rounded-xl bg-[#1A1A1A] text-white font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}