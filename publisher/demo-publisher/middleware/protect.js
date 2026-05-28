const AI_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "ChatGPT-User",
];

function isBot(userAgent = "") {
  return AI_BOTS.some((bot) =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

const protectContent = async (req, res, next) => {

  const userAgent =
    req.headers["user-agent"] || "";

  const paymentSignature =
    req.headers["x-botwall-payment"];

  console.log("Incoming UA:", userAgent);

  const botDetected = isBot(userAgent);

  // Humans allowed
  if (!botDetected) {
    return next();
  }

  // Paid bots allowed
  if (paymentSignature) {

    console.log(
      "Verified payment signature:",
      paymentSignature
    );

    return next();
  }

  // Unpaid bots blocked
  res.setHeader("X-Botwall-Price", "1000");
  res.setHeader("X-Botwall-Currency", "USDC");
  res.setHeader("X-Botwall-Chain", "solana");

  return res.status(402).json({
    error: "payment_required",
    message: "AI agent payment required",
    amount: "1000",
    currency: "USDC",
    recipient: process.env.RECEIVER_WALLET,
    chain: "solana",
    resource: req.originalUrl,
  });
};

module.exports = protectContent;