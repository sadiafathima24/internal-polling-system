const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const pollRoutes = require("./routes/pollRoutes");
const { verifyToken } = require("./middleware/authMiddleware");

dotenv.config();

const app = express();

/* =========================
   CORS CONFIGURATION
========================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://internal-polling-system.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // allow anyway for college project
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.options("*", cors());

app.use(express.json());

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);

/* =========================
   PROTECTED TEST ROUTE
========================= */
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user
  });
});

/* =========================
   ROOT TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Internal Polling Backend Running");
});

/* =========================
   DATABASE CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});