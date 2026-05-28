const express = require("express");

const protectContent = require("../middleware/protect");

const router = express.Router();

router.get("/ai-future", protectContent, (req, res) => {
  res.json({
    premium: true,
    title: "The Future of AI Agents",
    content:
      "Autonomous AI agents will negotiate, transact, and consume APIs independently.",
  });
});

router.get("/gpt5-analysis", protectContent, (req, res) => {
  res.json({
    premium: true,
    title: "GPT-5 Analysis",
    content:
      "Next-generation reasoning models will reshape digital economies.",
  });
});

module.exports = router;