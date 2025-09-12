import Stripe from "stripe";

import { PLANS } from "../configs/plan.js";
import Subscription from "../models/subscription.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: PLANS.premium.priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/subscription-success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
       billing_address_collection: "required",
       metadata: { userId: req.user.id },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const createBillingPortalSession = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the subscription for this user
    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({ error: "No active Stripe customer found" });
    }

    // Create a Billing Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/account`, // where to return after managing
    });

    res.json({ url: portalSession.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    res.status(500).json({ error: err.message });
  }
};