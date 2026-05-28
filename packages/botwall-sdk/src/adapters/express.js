/**
 * Express adapter.
 *
 * Usage:
 *   import express from "express";
 *   import { createBotwall } from "botwall-sdk";
 *   import { expressMiddleware } from "botwall-sdk/express";
 *
 *   const botwall = createBotwall({ walletAddress: process.env.SOLANA_WALLET_ADDRESS });
 *   const app = express();
 *
 *   // Protect all routes:
 *   app.use(expressMiddleware(botwall));
 *
 *   // Or protect just specific routes:
 *   app.use(expressMiddleware(botwall, { protect: ["/articles/*"] }));
 */

export function expressMiddleware(botwall, overrides = {}) {
  return async function botwallMiddleware(req, res, next) {
    try {
      const verdict = await botwall.run({
        method: req.method,
        pathname: req.originalUrl?.split("?")[0] || req.path,
        headers: req.headers,
      });

      if (verdict.kind === "passthrough") {
        if (verdict.payment) req.botwallPayment = verdict.payment;
        return next();
      }

      res.status(verdict.status);
      Object.entries(verdict.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
      res.json(verdict.body);
    } catch (err) {
      next(err);
    }
    // overrides currently reserved for future per-mount configuration.
    void overrides;
  };
}
