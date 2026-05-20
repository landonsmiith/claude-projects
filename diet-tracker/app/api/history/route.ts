import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get('days') ?? '30');

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [foodLogs, exerciseLogs, weightLogs] = await Promise.all([
      prisma.foodLog.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'desc' },
      }),
      prisma.exerciseLog.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'desc' },
      }),
      prisma.weightLog.findMany({
        where: { date: { gte: since } },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Aggregate daily totals for charting
    const dailyMap: Record<
      string,
      { date: string; calories: number; protein: number; carbs: number; fat: number; caloriesBurned: number }
    > = {};

    for (const log of foodLogs) {
      const key = log.date.toISOString().split('T')[0];
      if (!dailyMap[key]) {
        dailyMap[key] = { date: key, calories: 0, protein: 0, carbs: 0, fat: 0, caloriesBurned: 0 };
      }
      dailyMap[key].calories += log.calories;
      dailyMap[key].protein += log.protein;
      dailyMap[key].carbs += log.carbs;
      dailyMap[key].fat += log.fat;
    }

    for (const log of exerciseLogs) {
      const key = log.date.toISOString().split('T')[0];
      if (!dailyMap[key]) {
        dailyMap[key] = { date: key, calories: 0, protein: 0, carbs: 0, fat: 0, caloriesBurned: 0 };
      }
      dailyMap[key].caloriesBurned += log.caloriesBurned;
    }

    const dailyTotals = Object.values(dailyMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      dailyTotals,
      weightLogs,
      foodLogs,
      exerciseLogs,
    });
  } catch (error) {
    console.error('GET /api/history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
