import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    const where = date
      ? {
          date: {
            gte: new Date(date + 'T00:00:00.000Z'),
            lt: new Date(date + 'T23:59:59.999Z'),
          },
        }
      : {};

    const logs = await prisma.foodLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('GET /api/food-logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch food logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mealType, description, calories, protein, carbs, fat, fiber, sugar, sodium, date } = body;

    if (!mealType || !description || calories == null || protein == null || carbs == null || fat == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await prisma.foodLog.create({
      data: {
        mealType,
        description,
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        fiber: fiber != null ? Number(fiber) : null,
        sugar: sugar != null ? Number(sugar) : null,
        sodium: sodium != null ? Number(sodium) : null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('POST /api/food-logs error:', error);
    return NextResponse.json({ error: 'Failed to create food log' }, { status: 500 });
  }
}
