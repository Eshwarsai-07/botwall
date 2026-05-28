/**
 * Fastify plugin / hook adapter.
 *
 * Usage:
 *   import Fastify from "fastify";
 *   import { createBotwall } from "botwall-sdk";
 *   import { fastifyPlugin } from "botwall-sdk/fastify";
 *
 *   const botwall = createBotwall({ walletAddress: process.env.SOLANA_WALLET_ADDRESS });
 *   const app = Fastify();
 *
 *   await app.register(fastifyPlugin, {
 *     botwall,
 *     protect: ["/articles/*"],
 *   });
 */

export async function fastifyPlugin(fastify, opts = {}) {
  const botwall = opts.botwall || opts.paywall;
  if (!botwall) throw new Error("fastifyPlugin requires { botwall }");

  fastify.addHook("preHandler", async (req, reply) => {
    const verdict = await botwall.run({
      method: req.method,
      pathname: req.url.split("?")[0],
      headers: req.headers,
    });

    if (verdict.kind === "passthrough") {
      if (verdict.payment) req.botwallPayment = verdict.payment;
      return;
    }
    reply.code(verdict.status);
    Object.entries(verdict.headers || {}).forEach(([k, v]) => reply.header(k, v));
    return reply.send(verdict.body);
  });
}

// Fastify auto-detection (default export form)
fastifyPlugin[Symbol.for("skip-override")] = true;
