import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
    }

    // Check if this subscription already exists
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        subscription: {
          path: ['endpoint'],
          equals: subscription.endpoint,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already subscribed' });
    }

    await prisma.pushSubscription.create({
      data: { subscription },
    });

    return NextResponse.json({ message: 'Subscribed successfully' }, { status: 201 });
  } catch (error) {
    console.error('POST /api/push/subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        subscription: {
          path: ['endpoint'],
          equals: endpoint,
        },
      },
    });

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('DELETE /api/push/subscribe error:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
