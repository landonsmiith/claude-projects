'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface DailyTotal {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  caloriesBurned: number;
}

interface WeightLog {
  id: string;
  date: string;
  weight: number;
}

interface HistoryData {
  dailyTotals: DailyTotal[];
  weightLogs: WeightLog[];
}

type Range = '7' | '14' | '30' | '90';
type Chart = 'calories' | 'macros' | 'weight';

const CHART_TABS: { key: Chart; label: string }[] = [
  { key: 'calories', label: 'Calories' },
  { key: 'macros', label: 'Macros' },
  { key: 'weight', label: 'Weight' },
];

const RANGE_OPTS: Range[] = ['7', '14', '30', '90'];

function shortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'M/d');
}

export default function HistoryPage() {
  const [range, setRange] = useState<Range>('30');
  const [chart, setChart] = useState<Chart>('calories');
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingWeight, setDeletingWeight] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history?days=${range}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [range]);

  const deleteWeight = async (id: string) => {
    setDeletingWeight(id);
    await fetch(`/api/weight-logs?id=${id}`, { method: 'DELETE' });
    setDeletingWeight(null);
    const res = await fetch(`/api/history?days=${range}`);
    setData(await res.json());
  };

  const dailyTotals = data?.dailyTotals ?? [];
  const weightLogs = data?.weightLogs ?? [];

  const avgCalories = dailyTotals.length
    ? Math.round(dailyTotals.reduce((s, d) => s + d.calories, 0) / dailyTotals.length)
    : 0;
  const avgProtein = dailyTotals.length
    ? Math.round(dailyTotals.reduce((s, d) => s + d.protein, 0) / dailyTotals.length)
    : 0;

  const latestWeight = weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null;
  const oldestWeight = weightLogs.length > 1 ? weightLogs[0].weight : null;
  const weightChange =
    latestWeight && oldestWeight ? +(latestWeight - oldestWeight).toFixed(1) : null;

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">History</h1>
        <p className="text-sm text-gray-400 mt-0.5">Your trends over time</p>
      </div>

      {/* Range selector */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {RANGE_OPTS.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
              range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            {r}d
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-gray-900">{loading ? '—' : avgCalories}</div>
          <div className="text-xs text-gray-400">Avg kcal/day</div>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <div className="text-lg font-bold text-gray-900">{loading ? '—' : avgProtein}g</div>
          <div className="text-xs text-gray-400">Avg protein</div>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 text-center">
          <div
            className={`text-lg font-bold ${
              weightChange == null
                ? 'text-gray-400'
                : weightChange > 0
                ? 'text-red-500'
                : 'text-green-600'
            }`}
          >
            {loading
              ? '—'
              : weightChange == null
              ? '—'
              : `${weightChange > 0 ? '+' : ''}${weightChange}`}
          </div>
          <div className="text-xs text-gray-400">lbs change</div>
        </div>
      </div>

      {/* Chart card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {CHART_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setChart(key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                chart === key
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="h-48 animate-pulse bg-gray-100 rounded-xl" />
          ) : chart === 'calories' ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyTotals} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number) => [`${Math.round(v)} kcal`]}
                  labelFormatter={shortDate}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <ReferenceLine
                  y={2200}
                  stroke="#16a34a"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Goal',
                    position: 'right',
                    fontSize: 9,
                    fill: '#16a34a',
                  }}
                />
                <Bar dataKey="calories" fill="#16a34a" radius={[3, 3, 0, 0]} name="Consumed" />
                <Bar
                  dataKey="caloriesBurned"
                  fill="#60a5fa"
                  radius={[3, 3, 0, 0]}
                  name="Burned"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : chart === 'macros' ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyTotals} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number, name: string) => [`${Math.round(v)}g`, name]}
                  labelFormatter={shortDate}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="protein"
                  stroke="#60a5fa"
                  dot={false}
                  strokeWidth={2}
                  name="Protein"
                />
                <Line
                  type="monotone"
                  dataKey="carbs"
                  stroke="#fbbf24"
                  dot={false}
                  strokeWidth={2}
                  name="Carbs"
                />
                <Line
                  type="monotone"
                  dataKey="fat"
                  stroke="#a78bfa"
                  dot={false}
                  strokeWidth={2}
                  name="Fat"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : weightLogs.length < 2 ? (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">
              Log weight on multiple days to see a trend
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightLogs} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(v: number) => [`${v} lbs`]}
                  labelFormatter={shortDate}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#818cf8"
                  dot={{ r: 3, fill: '#818cf8' }}
                  strokeWidth={2}
                  name="Weight"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Weight history list */}
      {weightLogs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Weight Log
            </span>
          </div>
          <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
            {[...weightLogs].reverse().map((log) => (
              <li key={log.id} className="px-4 py-2.5 flex items-center">
                <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                  {format(parseISO(log.date), 'MMM d')}
                </span>
                <span className="text-sm font-semibold text-gray-800 flex-1">{log.weight} lbs</span>
                <button
                  onClick={() => deleteWeight(log.id)}
                  disabled={deletingWeight === log.id}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors disabled:opacity-50"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state */}
      {!loading && dailyTotals.length === 0 && weightLogs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-sm">No data yet for this period.</div>
          <div className="text-sm">Start logging to see your trends!</div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
