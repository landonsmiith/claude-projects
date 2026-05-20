'use client';

import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Scale, Flame, Dumbbell } from 'lucide-react';

interface MacroData {
  consumed: number;
  goal: number;
}

interface DashboardData {
  date: string;
  calories: { consumed: number; goal: number; burned: number };
  macros: { protein: MacroData; carbs: MacroData; fat: MacroData };
  micros: { fiber: number; sugar: number; sodium: number };
  foodLogs: FoodLog[];
  exerciseLogs: ExerciseLog[];
  latestWeight: { weight: number; date: string } | null;
}

interface FoodLog {
  id: string;
  mealType: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

interface ExerciseLog {
  id: string;
  description: string;
  caloriesBurned: number;
  durationMins: number | null;
  date: string;
}

function MacroBar({
  label,
  consumed,
  goal,
  color,
}: {
  label: string;
  consumed: number;
  goal: number;
  color: string;
}) {
  const pct = Math.min(100, goal > 0 ? (consumed / goal) * 100 : 0);
  const over = consumed > goal;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-semibold ${over ? 'text-red-500' : 'text-gray-800'}`}>
          {Math.round(consumed)}
          <span className="text-gray-400 font-normal">/{Math.round(goal)}g</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function DashboardPage() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const dateKey = format(date, 'yyyy-MM-dd');
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?date=${dateKey}`);
      const json = await res.json();
      setData(json);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const deleteFood = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/food-logs/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchData();
  };

  const deleteExercise = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/exercise-logs/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    fetchData();
  };

  const netCalories = data ? data.calories.consumed - data.calories.burned : 0;
  const calorieGoal = data?.calories.goal ?? 2200;
  const caloriePct = Math.min(100, calorieGoal > 0 ? (netCalories / calorieGoal) * 100 : 0);
  const calorieOver = netCalories > calorieGoal;

  const grouped: Record<string, FoodLog[]> = {};
  if (data) {
    for (const log of data.foodLogs) {
      if (!grouped[log.mealType]) grouped[log.mealType] = [];
      grouped[log.mealType].push(log);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header / Date nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() =>
              setDate((d) => {
                const n = new Date(d);
                n.setDate(n.getDate() - 1);
                return n;
              })
            }
            className="p-1.5 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800">
              {isToday ? 'Today' : format(date, 'EEE, MMM d')}
            </div>
            {!isToday && <div className="text-xs text-gray-400">{format(date, 'yyyy')}</div>}
          </div>
          <button
            onClick={() =>
              setDate((d) => {
                const n = new Date(d);
                n.setDate(n.getDate() + 1);
                return n;
              })
            }
            disabled={isToday}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-32 bg-gray-100 rounded-2xl" />
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Calorie ring */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-sm border border-green-100">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#dcfce7" strokeWidth="8" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={calorieOver ? '#f87171' : '#16a34a'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - caloriePct / 100)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className={`text-lg font-bold leading-none ${
                        calorieOver ? 'text-red-500' : 'text-green-700'
                      }`}
                    >
                      {Math.round(netCalories)}
                    </span>
                    <span className="text-xs text-gray-500">kcal</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Flame size={15} className="text-orange-400" />
                    <span className="text-gray-600">Consumed</span>
                    <span className="ml-auto font-semibold">
                      {Math.round(data?.calories.consumed ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Dumbbell size={15} className="text-blue-400" />
                    <span className="text-gray-600">Burned</span>
                    <span className="ml-auto font-semibold text-blue-600">
                      -{Math.round(data?.calories.burned ?? 0)}
                    </span>
                  </div>
                  <div className="border-t border-green-200 pt-1 flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Goal</span>
                    <span className="ml-auto font-semibold text-green-700">
                      {Math.round(calorieGoal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest weight */}
            {data?.latestWeight && (
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Scale size={18} className="text-indigo-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Latest Weight</div>
                  <div className="text-sm font-semibold text-gray-800">
                    {data.latestWeight.weight} lbs
                  </div>
                </div>
                <div className="ml-auto text-xs text-gray-400">
                  {format(new Date(data.latestWeight.date), 'MMM d')}
                </div>
              </div>
            )}

            {/* Macros */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Macros
              </div>
              <div className="space-y-3">
                <MacroBar
                  label="Protein"
                  consumed={data?.macros.protein.consumed ?? 0}
                  goal={data?.macros.protein.goal ?? 150}
                  color="bg-blue-400"
                />
                <MacroBar
                  label="Carbs"
                  consumed={data?.macros.carbs.consumed ?? 0}
                  goal={data?.macros.carbs.goal ?? 250}
                  color="bg-yellow-400"
                />
                <MacroBar
                  label="Fat"
                  consumed={data?.macros.fat.consumed ?? 0}
                  goal={data?.macros.fat.goal ?? 70}
                  color="bg-purple-400"
                />
              </div>
              {(data?.micros.fiber || data?.micros.sugar || data?.micros.sodium) ? (
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                  {data.micros.fiber > 0 && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Fiber</div>
                      <div className="text-sm font-semibold">{Math.round(data.micros.fiber)}g</div>
                    </div>
                  )}
                  {data.micros.sugar > 0 && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Sugar</div>
                      <div className="text-sm font-semibold">{Math.round(data.micros.sugar)}g</div>
                    </div>
                  )}
                  {data.micros.sodium > 0 && (
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Sodium</div>
                      <div className="text-sm font-semibold">
                        {Math.round(data.micros.sodium)}mg
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Food logs grouped by meal */}
            {MEAL_ORDER.filter((m) => grouped[m]?.length).map((meal) => (
              <div
                key={meal}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {MEAL_LABELS[meal]}
                  </span>
                  <span className="float-right text-xs text-gray-400">
                    {Math.round(grouped[meal].reduce((s, l) => s + l.calories, 0))} kcal
                  </span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {grouped[meal].map((log) => (
                    <li key={log.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800 leading-snug">{log.description}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          P {Math.round(log.protein)}g · C {Math.round(log.carbs)}g · F{' '}
                          {Math.round(log.fat)}g
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-700">
                          {Math.round(log.calories)}
                        </span>
                        <button
                          onClick={() => deleteFood(log.id)}
                          disabled={deletingId === log.id}
                          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none disabled:opacity-50"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Exercise logs */}
            {data?.exerciseLogs && data.exerciseLogs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Exercise
                  </span>
                </div>
                <ul className="divide-y divide-gray-50">
                  {data.exerciseLogs.map((log) => (
                    <li key={log.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-800">{log.description}</div>
                        {log.durationMins && (
                          <div className="text-xs text-gray-400 mt-0.5">{log.durationMins} min</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-600">
                          -{Math.round(log.caloriesBurned)}
                        </span>
                        <button
                          onClick={() => deleteExercise(log.id)}
                          disabled={deletingId === log.id}
                          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none disabled:opacity-50"
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty state */}
            {!loading &&
              data &&
              data.foodLogs.length === 0 &&
              data.exerciseLogs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">🥗</div>
                  <div className="text-sm">Nothing logged yet.</div>
                  <div className="text-sm">Tap Log to get started!</div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
