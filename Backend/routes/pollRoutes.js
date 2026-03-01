const express = require("express");
const { 
  createPoll, 
  getActivePolls, 
  votePoll,
  getPollResults
} = require("../controllers/pollController");

const { verifyToken, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

// 👑 ADMIN - Create Poll
router.post(
  "/",
  verifyToken,
  checkRole("ADMIN"),
  createPoll
);

// 👤 USER - Get Active Polls
router.get(
  "/",
  verifyToken,
  getActivePolls
);

// 👤 USER - Vote in Poll
router.post(
  "/vote",
  verifyToken,
  votePoll
);

// 📊 Get Poll Results (Logged-in users)
router.get(
  "/:pollId/results",
  verifyToken,
  getPollResults
);

module.exports = router;