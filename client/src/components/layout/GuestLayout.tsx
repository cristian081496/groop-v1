import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface GuestLayoutProps {
  children: ReactNode;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="flex h-16 justify-between items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary tracking-tight">Groop</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="btn-secondary px-4 py-2 rounded-md text-sm"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary px-4 py-2 rounded-md text-sm"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="py-8">
        <div className="mx-auto max-w-[1280px] px-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default GuestLayout;
