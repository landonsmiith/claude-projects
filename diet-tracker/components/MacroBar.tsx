const colorMap = {
  blue: { bar: 'bg-blue-500', text: 'text-blue-600' },
  orange: { bar: 'bg-orange-400', text: 'text-orange-500' },
  purple: { bar: 'bg-purple-500', text: 'text-purple-600' },
};

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  color: 'blue' | 'orange' | 'purple';
  unit?: string;
}

export default function MacroBar({ label, consumed, goal, color, unit = 'g' }: MacroBarProps) {
  const pct = Math.min(goal > 0 ? (consumed / goal) * 100 : 0, 100);
  const { bar, text } = colorMap[color];

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className={`text-xs font-semibold ${text}`}>{label}</span>
        <span className="text-xs text-gray-400">
          {Math.round(consumed)}{unit} / {Math.round(goal)}{unit}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${bar} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
