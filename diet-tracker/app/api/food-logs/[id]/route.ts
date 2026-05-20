import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.foodLog.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/food-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete food log' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const log = await prisma.foodLog.update({
      where: { id: params.id },
      data: {
        ...(body.mealType != null && { mealType: body.mealType }),
        ...(body.description != null && { description: body.description }),
        ...(body.calories != null && { calories: Number(body.calories) }),
        ...(body.protein != null && { protein: Number(body.protein) }),
        ...(body.carbs != null && { carbs: Number(body.carbs) }),
        ...(body.fat != null && { fat: Number(body.fat) }),
        ...(body.fiber != null && { fiber: Number(body.fiber) }),
        ...(body.sugar != null && { sugar: Number(body.sugar) }),
        ...(body.sodium != null && { sodium: Number(body.sodium) }),
      },
    });
    return NextResponse.json(log);
  } catch (error) {
    console.error('PATCH /api/food-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update food log' }, { status: 500 });
  }
}
