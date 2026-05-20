import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';
import type webpush from 'web-push';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const secret = request.headers.get('x-cron-secret') ?? request.headers.get('authorization')?.replace('Bearer ', '');
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptions = await prisma.pushSubscription.findMany();

    const payload = {
      title: 'NutriLog Reminder',
      body: 'Time to update your food journal! 🍽️',
      icon: '/icon-192.png',
      tag: 'nutrilog-reminder',
    };

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendPushNotification(sub.subscription as unknown as webpush.PushSubscription, payload)
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    // Clean up failed subscriptions (expired/unsubscribed)
    const expiredEndpoints: string[] = [];
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        const sub = subscriptions[i].subscription as { endpoint?: string };
        if (sub?.endpoint) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    });

    if (expiredEndpoints.length > 0) {
      for (const endpoint of expiredEndpoints) {
        await prisma.pushSubscription.deleteMany({
          where: {
            subscription: {
              path: ['endpoint'],
              equals: endpoint,
            },
          },
        });
      }
    }

    return NextResponse.json({ sent, failed, total: subscriptions.length });
  } catch (error) {
    console.error('POST /api/cron/notify error:', error);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
