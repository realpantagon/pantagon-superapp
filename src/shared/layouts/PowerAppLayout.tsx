import type { ReactNode } from 'react';

interface PowerAppLayoutProps {
  children: ReactNode;
}

export default function PowerAppLayout({ children }: PowerAppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {children}
    </div>
  );
}
