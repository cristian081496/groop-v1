import React, { ReactNode } from 'react';
import Navbar from '../Navbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-[1280px] px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
