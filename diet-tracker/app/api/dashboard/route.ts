import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    const [foodLogs, exerciseLogs, latestWeight, settings] = await Promise.all([
      prisma.foodLog.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.exerciseLog.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.weightLog.findFirst({
        orderBy: { date: 'desc' },
      }),
      prisma.settings.findUnique({ where: { id: 'singleton' } }),
    ]);

    const effectiveSettings = settings ?? {
      id: 'singleton',
      calorieGoal: 2200,
      proteinGoal: 150,
      carbGoal: 250,
      fatGoal: 70,
    };

    const consumed = {
      calories: foodLogs.reduce((s, l) => s + l.calories, 0),
      protein: foodLogs.reduce((s, l) => s + l.protein, 0),
      carbs: foodLogs.reduce((s, l) => s + l.carbs, 0),
      fat: foodLogs.reduce((s, l) => s + l.fat, 0),
      fiber: foodLogs.reduce((s, l) => s + (l.fiber ?? 0), 0),
      sugar: foodLogs.reduce((s, l) => s + (l.sugar ?? 0), 0),
      sodium: foodLogs.reduce((s, l) => s + (l.sodium ?? 0), 0),
    };

    const burned = exerciseLogs.reduce((s, l) => s + l.caloriesBurned, 0);

    return NextResponse.json({
      date: targetDate.toISOString(),
      calories: {
        consumed: consumed.calories,
        goal: effectiveSettings.calorieGoal,
        burned,
      },
      macros: {
        protein: { consumed: consumed.protein, goal: effectiveSettings.proteinGoal },
        carbs: { consumed: consumed.carbs, goal: effectiveSettings.carbGoal },
        fat: { consumed: consumed.fat, goal: effectiveSettings.fatGoal },
      },
      micros: {
        fiber: consumed.fiber,
        sugar: consumed.sugar,
        sodium: consumed.sodium,
      },
      foodLogs,
      exerciseLogs,
      latestWeight,
      settings: effectiveSettings,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
