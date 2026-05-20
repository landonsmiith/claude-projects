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

    const logs = await prisma.exerciseLog.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('GET /api/exercise-logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, caloriesBurned, durationMins, date } = body;

    if (!description || caloriesBurned == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const log = await prisma.exerciseLog.create({
      data: {
        description,
        caloriesBurned: Number(caloriesBurned),
        durationMins: durationMins != null ? Number(durationMins) : null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('POST /api/exercise-logs error:', error);
    return NextResponse.json({ error: 'Failed to create exercise log' }, { status: 500 });
  }
}
