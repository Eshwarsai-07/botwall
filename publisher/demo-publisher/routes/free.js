const express = require("express");

const router = express.Router();

router.get("/article", (req, res) => {
  res.json({
    premium: false,
    title: "Free AI Article",
    content: "Humans can access this freely.",
  });
});

module.exports = router;