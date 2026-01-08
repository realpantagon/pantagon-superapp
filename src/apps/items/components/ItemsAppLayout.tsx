import type { ReactNode } from 'react';
import ItemsNavbar from './ItemsNavbar';

interface ItemsAppLayoutProps {
  children: ReactNode;
}

export default function ItemsAppLayout({ children }: ItemsAppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <ItemsNavbar />
      <main className="max-w-md mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
}
