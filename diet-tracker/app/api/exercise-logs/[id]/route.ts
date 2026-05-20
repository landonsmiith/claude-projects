import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.exerciseLog.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/exercise-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete exercise log' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const log = await prisma.exerciseLog.update({
      where: { id: params.id },
      data: {
        ...(body.description != null && { description: body.description }),
        ...(body.caloriesBurned != null && { caloriesBurned: Number(body.caloriesBurned) }),
        ...(body.durationMins != null && { durationMins: Number(body.durationMins) }),
      },
    });
    return NextResponse.json(log);
  } catch (error) {
    console.error('PATCH /api/exercise-logs/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update exercise log' }, { status: 500 });
  }
}
