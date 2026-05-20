import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');

  try {
    const logs = await prisma.weightLog.findMany({
      orderBy: { date: 'desc' },
      take: limit ? Number(limit) : 90,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('GET /api/weight-logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch weight logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weight, date } = body;

    if (weight == null) {
      return NextResponse.json({ error: 'Weight is required' }, { status: 400 });
    }

    const log = await prisma.weightLog.create({
      data: {
        weight: Number(weight),
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('POST /api/weight-logs error:', error);
    return NextResponse.json({ error: 'Failed to create weight log' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.weightLog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/weight-logs error:', error);
    return NextResponse.json({ error: 'Failed to delete weight log' }, { status: 500 });
  }
}
