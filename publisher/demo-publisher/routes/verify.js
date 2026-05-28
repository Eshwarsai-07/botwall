const express = require("express");
const supabase =
  require("../lib/supabase");

const {
  Connection,
} = require("@solana/web3.js");

const router = express.Router();

console.log("RPC URL:", process.env.HELIUS_RPC_URL);

const connection = new Connection(
  process.env.HELIUS_RPC_URL
);

router.post("/", async (req, res) => {
  try {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({
        verified: false,
        error: "missing_signature",
      });
    }

    console.log("Verifying tx:", signature);

    let tx;

    try {
      tx = await connection.getParsedTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
    } catch (rpcErr) {
      console.error("RPC ERROR:", rpcErr.message);

      return res.status(400).json({
        verified: false,
        error: "invalid_transaction_signature",
      });
    }

    if (!tx) {
      return res.status(404).json({
        verified: false,
        error: "transaction_not_found",
      });
    }

    await supabase
    .from("payments")
    .insert([
      {
        tx: signature,
        wallet_address:
          process.env.RECEIVER_WALLET,
        network: "solana-devnet",
        bot_name: "GPTBot",
        user_agent: "GPTBot/1.0",
        path: "/premium/ai-future",
        lamports: 1000000,
      },
    ]);

    return res.json({
      verified: true,
      signature,
      slot: tx.slot,
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);

    return res.status(500).json({
      verified: false,
      error: "verification_failed",
    });
  }
});

module.exports = router;