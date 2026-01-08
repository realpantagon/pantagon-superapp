import type { ReactNode } from 'react';
import WeightNavbar from './WeightNavbar';

interface WeightAppLayoutProps {
  children: ReactNode;
}

export default function WeightAppLayout({ children }: WeightAppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <WeightNavbar />
      <main className="max-w-md mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
}
