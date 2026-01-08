import { useState } from "react";
import type { NewWeightEntry } from "../../../api/weight/types";

interface AddWeightModalProps {
  onSave: (entry: NewWeightEntry) => void;
  onClose: () => void;
  defaultWeight: number;
}

export default function AddWeightModal({
  onSave,
  onClose,
  defaultWeight,
}: AddWeightModalProps) {
  const intPart = Math.floor(defaultWeight || 83.0);
  const decPart = Math.round(((defaultWeight || 83.0) % 1) * 10);

  const [kg, setKg] = useState<number>(intPart);
  const [decimal, setDecimal] = useState<number>(decPart);
  const [note, setNote] = useState<string>("");

  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [exercise, setExercise] = useState<boolean>(false);
  const [date, setDate] = useState<string>(localISOTime);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = (): void => {
    if (isSaving) return;
    setIsSaving(true);
    const weight = parseFloat(`${kg}.${decimal}`);
    const entry: NewWeightEntry = {
      recorded_at: date,
      weight_kg: weight,
      details: note.trim() || undefined,
      exercised: exercise,
    };
    onSave(entry);
  };



  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-4 text-white relative">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Weight</h2>
              <p className="text-white/80 text-xs">Track your progress</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Weight Input - Featured */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <label className="block text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
              Current Weight
            </label>
            
            <div className="text-center mb-3">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {kg}.{decimal}
                <span className="text-lg text-gray-500 ml-1">kg</span>
              </div>
            </div>

            {/* Weight Controls */}
            <div className="space-y-3">
              {/* Whole number controls */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Kg</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setKg(Math.max(30, kg - 1))}
                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center text-gray-900 dark:text-white">
                    {kg}
                  </span>
                  <button
                    type="button"
                    onClick={() => setKg(Math.min(200, kg + 1))}
                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Decimal controls */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Decimal</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setDecimal(decimal === 0 ? 9 : decimal - 1)}
                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center text-gray-900 dark:text-white">
                    .{decimal}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDecimal(decimal === 9 ? 0 : decimal + 1)}
                    className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all"
            />
          </div>

          {/* Exercise Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🏃‍♂️</span>
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Exercise</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Did you work out?</div>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setExercise(!exercise)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                exercise ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                  exercise ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add notes..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-md"
            >
              {isSaving ? (
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
