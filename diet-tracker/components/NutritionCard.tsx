import { Check, X } from 'lucide-react';

interface FoodData {
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

interface ExerciseData {
  description: string;
  caloriesBurned: number;
  durationMins?: number | null;
}

interface WeightData {
  weight: number;
}

export type PendingItem =
  | { type: 'food'; data: FoodData }
  | { type: 'exercise'; data: ExerciseData }
  | { type: 'weight'; data: WeightData };

export default function NutritionCard({
  pending,
  onConfirm,
  onModify,
}: {
  pending: PendingItem;
  onConfirm: () => void;
  onModify: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {pending.type === 'food' && (
        <>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 mr-3">
              <h3 className="font-semibold text-gray-800 text-sm leading-snug">{pending.data.description}</h3>
              <span className="text-xs text-gray-400 capitalize">{pending.data.mealType}</span>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-green-600">{Math.round(pending.data.calories)}</p>
              <p className="text-xs text-gray-400">cal</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3 bg-gray-50 rounded-xl p-2.5">
            <div className="text-center">
              <p className="text-sm font-bold text-blue-600">{Math.round(pending.data.protein)}g</p>
              <p className="text-[10px] text-gray-500">Protein</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-orange-500">{Math.round(pending.data.carbs)}g</p>
              <p className="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-purple-600">{Math.round(pending.data.fat)}g</p>
              <p className="text-[10px] text-gray-500">Fat</p>
            </div>
          </div>
          {(pending.data.fiber != null || pending.data.sugar != null || pending.data.sodium != null) && (
            <div className="flex gap-3 text-[11px] text-gray-400 mb-3">
              {pending.data.fiber != null && <span>Fiber: {Math.round(pending.data.fiber)}g</span>}
              {pending.data.sugar != null && <span>Sugar: {Math.round(pending.data.sugar)}g</span>}
              {pending.data.sodium != null && <span>Sodium: {Math.round(pending.data.sodium)}mg</span>}
            </div>
          )}
        </>
      )}

      {pending.type === 'exercise' && (
        <div className="mb-3">
          <h3 className="font-semibold text-gray-800 text-sm mb-2">{pending.data.description}</h3>
          <div className="flex gap-4">
            <div>
              <p className="text-2xl font-bold text-orange-500">{Math.round(pending.data.caloriesBurned)}</p>
              <p className="text-xs text-gray-400">cal burned</p>
            </div>
            {pending.data.durationMins != null && (
              <div>
                <p className="text-2xl font-bold text-gray-700">{pending.data.durationMins}</p>
                <p className="text-xs text-gray-400">minutes</p>
              </div>
            )}
          </div>
        </div>
      )}

      {pending.type === 'weight' && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-1">Log weight</p>
          <p className="text-3xl font-bold text-gray-800">
            {pending.data.weight}{' '}
            <span className="text-base font-normal text-gray-400">lbs</span>
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-xl font-semibold text-sm active:bg-green-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          Log It
        </button>
        <button
          onClick={onModify}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold text-sm active:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
          Change
        </button>
      </div>
    </div>
  );
}
