// api/create-payment-intent.js
// Función serverless de Vercel. La secret key de Stripe SOLO vive aquí,
// como variable de entorno (STRIPE_SECRET_KEY) configurada en el dashboard de Vercel.
// NUNCA la pongas directamente en este archivo ni en el código del frontend.

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { amount, currency = "mxn" } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Monto inválido" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // en centavos, ej. $150.00 MXN = 15000
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: "No se pudo crear el pago." });
  }
}
