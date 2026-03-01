const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Poll",
    required: true
  },
  selectedOptionIndex: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// 🔒 Enforce one vote per user per poll (database-level)
voteSchema.index({ userId: 1, pollId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", voteSchema);    