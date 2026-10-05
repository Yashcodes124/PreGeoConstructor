import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header />
      <main className={`flex-1 ${fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
