import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

const iso = (seconds?: number | null) =>
  seconds ? new Date(seconds * 1000).toISOString() : null;

// Premium stays on while the paid period runs, including after a cancellation
// request and during payment retries.
function entitled(status: string, periodEnd: string | null): boolean {
  const future = !periodEnd || new Date(periodEnd) > new Date();
  if (["active", "trialing", "past_due"].includes(status)) return future;
  if (status === "canceled") return !!periodEnd && new Date(periodEnd) > new Date();
  return false;
}

async function upsertSubscription(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("No userId in subscription metadata", subscription.id);
    return;
  }

  const item = subscription.items?.data?.[0];
  const priceId = item?.price?.lookup_key
    || item?.price?.metadata?.lovable_external_id
    || item?.price?.id;
  const productId = typeof item?.price?.product === "string"
    ? item.price.product
    : item?.price?.product?.id;

  const periodStart = iso(item?.current_period_start ?? subscription.current_period_start);
  const periodEnd = iso(item?.current_period_end ?? subscription.current_period_end);
  const stripeStatus: string = subscription.status;
  const isEntitled = entitled(stripeStatus, periodEnd);

  const { error } = await getSupabase()
    .from("subscriptions")
    .upsert({
      user_id: userId,
      plan: isEntitled ? "premium" : "free",
      status: isEntitled ? "active" : (stripeStatus === "canceled" ? "cancelled" : "expired"),
      stripe_subscription_id: subscription.id,
      stripe_customer_id: typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id,
      product_id: productId,
      price_id: priceId,
      stripe_status: stripeStatus,
      trial_end: iso(subscription.trial_end),
      current_period_start: periodStart,
      current_period_end: periodEnd,
      expires_at: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) console.error("subscription upsert failed:", error);
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  const periodEnd = iso(
    subscription.items?.data?.[0]?.current_period_end ?? subscription.current_period_end,
  );
  const stillEntitled = !!periodEnd && new Date(periodEnd) > new Date();

  const { error } = await getSupabase()
    .from("subscriptions")
    .update({
      stripe_status: "canceled",
      plan: stillEntitled ? "premium" : "free",
      status: "cancelled",
      cancel_at_period_end: true,
      current_period_end: periodEnd,
      expires_at: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);

  if (error) console.error("subscription delete update failed:", error);
}

async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await upsertSubscription(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "invoice.paid":
      // Subscription state is kept current by the customer.subscription.* events.
      console.log("Payment event received:", event.type);
      break;
    default:
      console.log("Unhandled event:", event.type);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    console.error("Webhook received with invalid env:", rawEnv);
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await handleWebhook(req, rawEnv);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
