/**
 * Next.js adapter — supports both:
 *   1) `/middleware.ts` (Edge / Node runtime) via `botwallMiddleware`
 *   2) Pages API routes via `withBotwall(handler)`
 *   3) App Router route handlers via `withRouteHandler(handler)`
 *
 * Examples:
 *
 *   // middleware.ts (recommended)
 *   import { createBotwall } from "botwall-sdk";
 *   import { botwallMiddleware } from "botwall-sdk/nextjs";
 *
 *   const botwall = createBotwall({ walletAddress: process.env.SOLANA_WALLET_ADDRESS });
 *   export default botwallMiddleware(botwall);
 *   export const config = { matcher: ["/articles/:path*"] };
 *
 *   // App Router route handler
 *   import { withRouteHandler } from "botwall-sdk/nextjs";
 *   export const GET = withRouteHandler(botwall, async (req) => Response.json({ ok: true }));
 */

function buildResponse(verdict, NextResponse) {
  if (NextResponse) {
    return NextResponse.json(verdict.body, { status: verdict.status });
  }
  return new Response(JSON.stringify(verdict.body), {
    status: verdict.status,
    headers: verdict.headers || { "Content-Type": "application/json" },
  });
}

/**
 * Edge / middleware. Returns a function compatible with Next.js middleware.
 */
export function botwallMiddleware(botwall) {
  return async function nextMiddleware(request) {
    let NextResponse;
    try {
      ({ NextResponse } = await import("next/server"));
    } catch {
      NextResponse = null;
    }

    const url = new URL(request.url);
    const verdict = await botwall.run({
      method: request.method,
      pathname: url.pathname,
      headers: request.headers,
    });

    if (verdict.kind === "passthrough") {
      return NextResponse ? NextResponse.next() : new Response(null, { status: 200 });
    }
    return buildResponse(verdict, NextResponse);
  };
}

/**
 * Pages-router API wrapper.
 */
export function withBotwall(botwall, handler) {
  return async function botwalledApi(req, res) {
    const verdict = await botwall.run({
      method: req.method,
      pathname: req.url?.split("?")[0] || "/",
      headers: req.headers,
    });
    if (verdict.kind === "passthrough") {
      if (verdict.payment) req.botwallPayment = verdict.payment;
      return handler(req, res);
    }
    res.status(verdict.status);
    Object.entries(verdict.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
    return res.json(verdict.body);
  };
}

/**
 * App Router route handler wrapper.
 */
export function withRouteHandler(botwall, handler) {
  return async function botwalledHandler(request, context) {
    const url = new URL(request.url);
    const verdict = await botwall.run({
      method: request.method,
      pathname: url.pathname,
      headers: request.headers,
    });
    if (verdict.kind === "passthrough") {
      return handler(request, context);
    }
    return new Response(JSON.stringify(verdict.body), {
      status: verdict.status,
      headers: verdict.headers || { "Content-Type": "application/json" },
    });
  };
}
