import type { ReactNode } from 'react';
import { cn } from '../utils/helpers';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6',
      className
    )}>
      {children}
    </div>
  );
}
