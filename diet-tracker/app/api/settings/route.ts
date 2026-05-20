import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'singleton', calorieGoal: 2200, proteinGoal: 150, carbGoal: 250, fatGoal: 70 },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { calorieGoal, proteinGoal, carbGoal, fatGoal } = body;

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        calorieGoal: calorieGoal ?? 2200,
        proteinGoal: proteinGoal ?? 150,
        carbGoal: carbGoal ?? 250,
        fatGoal: fatGoal ?? 70,
      },
      update: {
        ...(calorieGoal != null && { calorieGoal: Number(calorieGoal) }),
        ...(proteinGoal != null && { proteinGoal: Number(proteinGoal) }),
        ...(carbGoal != null && { carbGoal: Number(carbGoal) }),
        ...(fatGoal != null && { fatGoal: Number(fatGoal) }),
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('PATCH /api/settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
