import React from 'react';
import { format } from 'date-fns';

interface HeaderProps {
  showSubtitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showSubtitle = true }) => {
  const today = new Date();
  
  return (
    <header className="pt-16 sm:pt-20 pb-6 sm:pb-8">
      <div className="flex justify-between items-start">
        <div className="max-w-[70%]">
          <h1 className="text-[48px] sm:text-[64px] font-medium leading-[0.9] tracking-tight text-white">
            Task<br />Attack
          </h1>
          {showSubtitle && (
            <p className="text-base sm:text-lg text-gray-400 mt-4 mb-6 sm:mb-0 leading-snug">
              Crush Your List,<br />
              One Task at a Time.
            </p>
          )}
        </div>
        <div className="bg-[#EF442D] p-4 sm:p-6 rounded-3xl text-[#232223] text-right min-w-[140px] sm:min-w-[180px]">
          <div className="text-2xl sm:text-3xl font-medium mb-1 text-left">
            {format(today, 'EEEE')}
          </div>
          <div className="text-[64px] sm:text-[80px] font-medium leading-none mb-1 text-center">
            {format(today, 'dd')}
          </div>
          <div className="text-xl sm:text-2xl font-medium flex justify-between">
            <span>{format(today, 'MMM')}</span>
            <span>{format(today, 'yyyy')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};