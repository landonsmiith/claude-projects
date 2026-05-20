'use client';

import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface FoodLog {
  id: string;
  description: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
}

const mealColors: Record<string, string> = {
  breakfast: 'bg-yellow-100 text-yellow-700',
  lunch: 'bg-blue-100 text-blue-700',
  dinner: 'bg-indigo-100 text-indigo-700',
  snack: 'bg-gray-100 text-gray-600',
};

export default function FoodLogItem({
  log,
  onDelete,
}: {
  log: FoodLog;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        className="w-full flex items-center px-3 py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{log.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                mealColors[log.mealType] ?? mealColors.snack
              }`}
            >
              {log.mealType}
            </span>
            <span className="text-xs text-gray-500">{Math.round(log.calories)} cal</span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-300" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(log.id);
            }}
            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 bg-gray-50 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <p className="text-xs font-bold text-blue-600">{Math.round(log.protein)}g</p>
              <p className="text-[10px] text-gray-400">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-orange-500">{Math.round(log.carbs)}g</p>
              <p className="text-[10px] text-gray-400">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-purple-600">{Math.round(log.fat)}g</p>
              <p className="text-[10px] text-gray-400">Fat</p>
            </div>
          </div>
          {(log.fiber != null || log.sugar != null || log.sodium != null) && (
            <div className="flex gap-3 mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
              {log.fiber != null && <span>Fiber {Math.round(log.fiber)}g</span>}
              {log.sugar != null && <span>Sugar {Math.round(log.sugar)}g</span>}
              {log.sodium != null && <span>Sodium {Math.round(log.sodium)}mg</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
