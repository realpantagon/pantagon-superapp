import { cn } from '../utils/helpers';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
        active
          ? 'bg-primary-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
      )}
    >
      {label}
    </button>
  );
}
