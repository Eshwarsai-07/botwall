import "dotenv/config";
import express from "express";
import { createPaywall } from "botwall-sdk";
import { expressMiddleware } from "botwall-sdk/express";

const app = express();
const PORT = process.env.PORT || 4000;

const paywall = createPaywall({
  walletAddress: process.env.SOLANA_WALLET_ADDRESS,
  network: process.env.SOLANA_NETWORK || "devnet",
  // apiUrl defaults to https://botwall-production.up.railway.app
  // Override with BOTWALL_URL=http://localhost:3000 for local dev
  apiUrl: process.env.BOTWALL_URL,
  protect: ["/articles/*"],
  basePriceMicroUsdc: 1_000,
  failOpen: false,
});

app.use(expressMiddleware(paywall));

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Public root — no paywall." });
});

app.get("/articles/:slug", (req, res) => {
  res.json({
    title: `Article: ${req.params.slug}`,
    body: "This is paid content. AI bots had to pay to access this.",
    paymentInfo: req.paywallPayment || null,
  });
});

app.listen(PORT, () => {
  console.log(`Example server running on http://localhost:${PORT}`);
  console.log(`Receiving USDC at: ${process.env.SOLANA_WALLET_ADDRESS}`);
});
