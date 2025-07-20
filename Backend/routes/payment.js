const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/user");
const passport = require("passport");
require("dotenv").config();

const authenticate = passport.authenticate("jwt", { session: false });
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // Verify the signature using your endpoint secret
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    // console.log("Webhook Event:", event.type);
  } catch (err) {
    console.error("Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription start
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;
    const plan = session.metadata.plan;
    const subscriptionId = session.subscription; // Get subscription ID
    // console.log("Processing subscription start for:", email, "Plan:", plan, "Subscription ID:", subscriptionId);
    try {
      const user = await User.findOneAndUpdate(
        { email },
        { 
          isSubscribed: true, 
          subscriptionPlan: plan, 
          stripeSubscriptionId: subscriptionId // Store this
        },
        { new: true }
      );
      // console.log("User updated:", user);
      if (!user) console.error("User not found for email:", email);
    } catch (error) {
      console.error("DB update failed:", error);
      return res.status(500).send("Webhook Error: Database failure");
    }
  }

  // Handle subscription status changes (e.g., cancellation, payment failure)
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const status = subscription.status; // e.g., "active", "canceled", "unpaid"
    // console.log("Subscription event:", event.type, "ID:", subscriptionId, "Status:", status);

    try {
      const user = await User.findOne({ stripeSubscriptionId: subscriptionId });
      if (user) {
        if (status === "canceled" || status === "unpaid") {
          const updatedUser = await User.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { isSubscribed: false, subscriptionPlan: null },
            { new: true }
          );
          // console.log("Subscription ended for user:", updatedUser.email);
        } else if (status === "active") {
          const updatedUser = await User.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { isSubscribed: true },
            { new: true }
          );
          // console.log("Subscription still active for user:", updatedUser.email);
        }
      } else {
        console.error("No user found for subscription:", subscriptionId);
      }
    } catch (error) {
      console.error("DB update failed:", error);
      return res.status(500).send("Webhook Error: Database failure");
    }
  }

  res.status(200).json({ received: true });
});

// No changes needed for /create-checkout-session
router.post("/create-checkout-session", authenticate, async (req, res) => {
  const { plan } = req.body;
  const email = req.user.email;
  const priceIds = {
    monthly: "price_1R40jrBDjDvdnksFC5FuYpgH",
    "6months": "price_1R40jrBDjDvdnksFGz0MQWlF",
    yearly: "price_1R40jrBDjDvdnksF0Tj2visy",
  };
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceIds[plan], quantity: 1 }],
      mode: "subscription",
      success_url: "http://localhost:3000/home?success=true",
      cancel_url: "http://localhost:3000/subscribe?cancel=true",
      customer_email: email,
      metadata: { plan },
    });
    // console.log("Session created:", session.id);
    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("Stripe Error:", error);
    return res.status(400).json({ error: "Failed to create checkout session" });
  }
});

module.exports = router;