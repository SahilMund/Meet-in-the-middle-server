import dotenv from "dotenv";
import Stripe from "stripe";

import Subscription from "../models/subscription.model.js";

dotenv.config({ quiet: true });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw buffer
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const obj = event.data.object;

    switch (event.type) {
      // ✅ When payment is completed via checkout
      case "checkout.session.completed": {
        const userId = obj.metadata?.userId;
        const subscriptionId = obj.subscription;
        const stripeCustomerId = obj.customer;

        console.log("New subscription for user:", userId);

        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              user: userId,
              plan: "premium",
              stripeCustomerId,
              stripeSubscriptionId: subscriptionId,
              status: "active",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        break;
      }

      // ✅ When recurring payment succeeds
      case "invoice.payment_succeeded": {
        const subscription = await stripe.subscriptions.retrieve(obj.subscription);

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              status: subscription.status,
            },
          }
        );
        break;
      }

      // ✅ When subscription is canceled
      case "customer.subscription.deleted": {
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: obj.id },
          {
            $set: {
              plan: "free",
              stripeSubscriptionId: null,
              stripeCustomerId: null,
              currentPeriodEnd: null,
              status: "canceled",
            },
          }
        );
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;

        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            $set: {
              currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
              status: subscription.status,
            },
          },
          { upsert: true }
        );
        break;
      }


      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling failed:", err);
    res.status(500).send("Internal server error");
  }
};
