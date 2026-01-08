interface AddButtonProps {
  onClick: () => void;
}

export default function AddButton({ onClick }: AddButtonProps) {
  return (
    <button
      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl w-full hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/20 font-medium mb-6"
      onClick={onClick}
    >
      <span className="flex items-center justify-center gap-2">
        <span className="text-lg">+</span>
        Add Weight Entry
      </span>
    </button>
  );
}
