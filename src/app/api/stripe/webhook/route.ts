import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripeConfig, saveSubscription, addWebhookLog, SubscriptionItem } from '@/src/lib/serverState';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const stripeSignature = req.headers.get('stripe-signature');
    const secretKey = stripeConfig.secretKey || process.env.STRIPE_SECRET_KEY;
    const webhookSecret = stripeConfig.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (secretKey && webhookSecret && stripeSignature) {
      const stripe = new Stripe(secretKey);
      try {
        event = stripe.webhooks.constructEvent(rawBody, stripeSignature, webhookSecret);
      } catch (err: any) {
        console.error('⚠️ Stripe Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      // Parse payload directly if in development/test without signature secret
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    const eventType = event.type || 'unknown_event';
    const dataObj = (event.data?.object as any) || {};
    const userId = dataObj.metadata?.userId || dataObj.customer || 'U_stripe_customer';

    // Handle specific subscription events
    switch (eventType) {
      case 'checkout.session.completed': {
        const session = dataObj as Stripe.Checkout.Session;
        const subId = (session.subscription as string) || session.id;
        const trialDays = stripeConfig.trialDays || 3;
        const now = new Date();
        const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

        saveSubscription({
          id: subId,
          userId: (session.metadata?.userId as string) || 'U_subscriber_' + Date.now(),
          userEmail: session.customer_details?.email || undefined,
          planName: `Tsundoku Pro (3 วันแรกฟรี จากนั้น ${stripeConfig.priceAmountThb || 39} บ./เดือน)`,
          status: 'trialing',
          trialEndsAt: trialEndsAt.toISOString(),
          currentPeriodEnd: new Date(now.getTime() + (trialDays + 30) * 24 * 60 * 60 * 1000).toISOString(),
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subId,
          createdAt: now.toISOString(),
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = dataObj as Stripe.Subscription;
        const statusMap: Record<string, SubscriptionItem['status']> = {
          trialing: 'trialing',
          active: 'active',
          canceled: 'canceled',
          past_due: 'past_due',
        };

        saveSubscription({
          id: sub.id,
          userId: (sub.metadata?.userId as string) || (sub.customer as string) || 'U_sub',
          planName: `Tsundoku Pro (${stripeConfig.priceAmountThb || 39} บ./เดือน)`,
          status: statusMap[sub.status] || 'active',
          trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : new Date().toISOString(),
          currentPeriodEnd: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000).toISOString() : new Date().toISOString(),
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          createdAt: new Date(sub.created * 1000).toISOString(),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = dataObj as Stripe.Subscription;
        saveSubscription({
          id: sub.id,
          userId: (sub.metadata?.userId as string) || (sub.customer as string) || 'U_sub',
          planName: 'Tsundoku Pro',
          status: 'canceled',
          trialEndsAt: new Date().toISOString(),
          currentPeriodEnd: new Date().toISOString(),
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          createdAt: new Date(sub.created * 1000).toISOString(),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = dataObj as Stripe.Invoice;
        console.log(`💰 Stripe Invoice payment succeeded: ${invoice.id}, amount: ${invoice.amount_paid}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = dataObj as Stripe.Invoice;
        console.warn(`⚠️ Stripe Invoice payment failed: ${invoice.id}`);
        break;
      }
    }

    // Log to Webhook system for live Backoffice inspection
    addWebhookLog({
      id: 'stripe-hook-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('th-TH'),
      source: 'real_line_webhook',
      eventType: `stripe:${eventType}`,
      userId,
      payload: {
        id: dataObj.id,
        eventType,
        amount: dataObj.amount_total || dataObj.amount || (stripeConfig.priceAmountThb * 100),
        currency: dataObj.currency || 'thb',
        status: dataObj.status,
      },
      botReply: `Stripe Event: ${eventType} ได้รับและประมวลผลสำเร็จ`,
    });

    return NextResponse.json({ received: true, eventType });
  } catch (err: any) {
    console.error('Stripe webhook processing error:', err);
    return NextResponse.json({ error: err?.message }, { status: 400 });
  }
}
