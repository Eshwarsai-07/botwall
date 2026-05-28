const express = require("express");

const supabase =
  require("../lib/supabase");

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    const { data, error } =
      await supabase
        .from("payments")
        .select("*")
        .order("timestamp", {
          ascending: false,
        });

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    const totalPayments =
      data.length;

    const uniqueBots =
      new Set(
        data.map((p) => p.bot_name)
      ).size;

    const totalEarned =
      data.reduce(
        (sum, p) =>
          sum + (p.lamports || 0),
        0
      ) / 1_000_000_000;

    const latestPayment =
      data[0] || null;

    return res.json({
      totalPayments,
      uniqueBots,
      totalEarned,
      latestPayment,
      payments: data,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "stats_failed",
    });
  }
});

module.exports = router;