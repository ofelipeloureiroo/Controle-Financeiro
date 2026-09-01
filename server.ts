import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (Only if credentials exist)
const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
if (serviceAccountBase64) {
  try {
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString());
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Webhooks will not be able to update Firestore.");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Stripe Webhook MUST use express.raw BEFORE express.json()
  app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      res.status(400).send("Webhook Secret is not configured.");
      return;
    }

    let event;

    try {
      const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY as string);
      event = stripeClient.webhooks.constructEvent(req.body, sig as string, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const uid = session.client_reference_id;
      
      if (uid && getApps().length > 0) {
        try {
          const db = getFirestore();
          // Calculate new due date (1 month from now)
          const baseDate = new Date();
          baseDate.setMonth(baseDate.getMonth() + 1);
          
          await db.collection('users').doc(uid).update({
            subscriptionDueDate: baseDate.toISOString(),
            status: 'active'
          });
          console.log(`Successfully updated subscription for user ${uid}`);
        } catch (error) {
          console.error("Error updating Firestore from Webhook:", error);
        }
      } else {
        console.warn("No UID found in session or Firebase Admin not initialized.");
      }
    }

    res.json({ received: true });
  });

  // Standard JSON middleware for other routes
  app.use(express.json());

  // Create Checkout Session
  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { uid, email } = req.body;
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

      if (!stripeKey) {
        return res.status(500).json({ error: "STRIPE_SECRET_KEY is required" });
      }

      const stripeClient = new Stripe(stripeKey);

      // Create Checkout Session
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Mensalidade - Meu Escritório Online',
                description: 'Acesso completo ao sistema de gestão.',
              },
              unit_amount: 5000, // R$ 50,00
            },
            quantity: 1,
          },
        ],
        mode: 'payment', // using payment mode for one-time or subscription for recurring
        success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${appUrl}/?canceled=true`,
        client_reference_id: uid,
        customer_email: email,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
