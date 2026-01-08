import { ReactNode } from 'react';
import FCDNavbar from './FCDNavbar';

interface FCDAppLayoutProps {
  children: ReactNode;
}

export default function FCDAppLayout({ children }: FCDAppLayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <FCDNavbar />
      <main className="max-w-2xl mx-auto px-4 pb-20">
        {children}
      </main>
    </div>
  );
}
