/**
 * Optional LangChain helper.
 *
 * Wrap an `botwall-agent-sdk` client into a LangChain `DynamicStructuredTool`
 * so an LLM can fetch paid URLs without ever touching crypto plumbing.
 *
 *   import { createAgentBotwallClient, fromKeypairFile } from "botwall-agent-sdk";
 *   import { botwallFetchTool } from "botwall-agent-sdk/langchain";
 *
 *   const client = createAgentBotwallClient({
 *     network: "devnet",
 *     signer: fromKeypairFile(),
 *     maxAmountMicroUsdc: 5_000,
 *   });
 *
 *   const tool = botwallFetchTool(client, {
 *     // optionally restrict which hosts the LLM can hit
 *     allowHost: (host) => host.endsWith("example.com"),
 *   });
 *
 *   const agent = createOpenAIToolsAgent({ llm, tools: [tool], prompt });
 *
 * The tool input schema:
 *   { url: string, method?: "GET"|"POST", body?: string, headers?: object }
 *
 * The tool output:
 *   { status, body, signature?, amountMicroUsdc? }
 */

export function botwallFetchTool(client, options = {}) {
  const { name = "botwall_fetch", description, allowHost } = options;

  return {
    name,
    description:
      description ||
      "Fetch a URL that may require an HTTP 402 USDC payment. Pays automatically inside operator-defined budget caps.",

    schema: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", description: "Absolute URL to fetch" },
        method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"], default: "GET" },
        body: { type: "string", description: "Optional request body (string)" },
        headers: { type: "object", additionalProperties: { type: "string" } },
      },
    },

    async invoke({ url, method = "GET", body, headers }) {
      if (allowHost) {
        try {
          const u = new URL(url);
          if (!allowHost(u.host)) {
            return JSON.stringify({
              status: 0,
              error: `Host ${u.host} not allowed by operator policy.`,
            });
          }
        } catch {
          return JSON.stringify({ status: 0, error: "Invalid URL" });
        }
      }

      try {
        const res = await client.fetch(url, { method, body, headers });
        const text = await res.text();
        return JSON.stringify({
          status: res.status,
          body: text,
          signature: res.botwallPayment?.signature || null,
          amountMicroUsdc: res.botwallPayment?.amountMicroUsdc || null,
        });
      } catch (err) {
        return JSON.stringify({
          status: 0,
          error: err.message,
          code: err.code || "FETCH_FAILED",
        });
      }
    },
  };
}
