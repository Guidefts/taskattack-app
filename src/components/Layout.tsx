import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <main className="max-w-full mx-auto px-4">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};