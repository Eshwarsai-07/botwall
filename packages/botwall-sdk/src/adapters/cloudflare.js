/**
 * Cloudflare Workers adapter.
 *
 * Usage:
 *   import { createBotwall } from "botwall-sdk";
 *   import { cloudflareHandler } from "botwall-sdk/cloudflare";
 *
 *   export default {
 *     async fetch(request, env, ctx) {
 *       const botwall = createBotwall({ walletAddress: env.SOLANA_WALLET_ADDRESS });
 *       return cloudflareHandler(botwall, request, async () => {
 *         return new Response("Premium content");
 *       });
 *     },
 *   };
 *
 * If you want a one-liner that wraps an existing handler:
 *   export default { fetch: withBotwall(botwall, originalFetch) };
 */

export async function cloudflareHandler(botwall, request, originHandler) {
  const url = new URL(request.url);
  const verdict = await botwall.run({
    method: request.method,
    pathname: url.pathname,
    headers: request.headers,
  });

  if (verdict.kind === "passthrough") {
    return originHandler(request, verdict.payment);
  }

  return new Response(JSON.stringify(verdict.body), {
    status: verdict.status,
    headers: verdict.headers || { "Content-Type": "application/json" },
  });
}

export function withBotwall(botwall, originHandler) {
  return async function botwallFetch(request, env, ctx) {
    return cloudflareHandler(
      botwall,
      request,
      (req, payment) => originHandler(req, env, ctx, payment),
    );
  };
}
