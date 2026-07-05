import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe webhook → entitlements.
 * One Stripe customer per user; the entitlements table gates tiers (per the architecture doc).
 * Configure in Stripe: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
 */
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  const db = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "payment") {
        // One-time Toolkit purchase
        await db.from("purchases").insert({
          email: session.customer_details?.email ?? "",
          product: "toolkit",
          stripe_payment_intent: String(session.payment_intent ?? ""),
          amount_cents: session.amount_total,
        });
        // TODO: grant a signed download link from Supabase storage (toolkit bucket)
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const product =
        priceId === process.env.STRIPE_PRICE_BOOMERANG ? "boomerang" : "dashboard";
      const status =
        sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status === "past_due"
            ? "past_due"
            : "canceled";

      // user_id is resolved via stripe_customer_id, stored at signup/checkout
      await db
        .from("entitlements")
        .update({
          status,
          stripe_subscription_id: sub.id,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_customer_id", String(sub.customer))
        .eq("product", product);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
