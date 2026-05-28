require("dotenv").config();

const express = require("express");
const cors = require("cors");

const freeRoutes = require("./routes/free");
const premiumRoutes = require("./routes/premium");
const verifyRoutes = require("./routes/verify");
const statsRoutes =
  require("./routes/stats");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Botwall Demo Publisher",
    status: "live",
  });
});

app.use("/stats", statsRoutes);
app.use("/free", freeRoutes);
app.use("/premium", premiumRoutes);
app.use("/verify", verifyRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Botwall demo running on ${PORT}`);
});