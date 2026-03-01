const Vote = require("../models/Vote");
const Poll = require("../models/Poll");

// 🗳 Create Poll (ADMIN only)
exports.createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    // Basic validation
    if (!question || !options || options.length < 2) {
      return res.status(400).json({
        message: "Poll must have a question and at least 2 options"
      });
    }

    // Format options properly
    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0
    }));

    const newPoll = new Poll({
      question,
      options: formattedOptions,
      createdBy: req.user.id
    });

    await newPoll.save();

    res.status(201).json({
      message: "Poll created successfully",
      poll: newPoll
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// 📋 Get Active Polls (Logged-in users)
exports.getActivePolls = async (req, res) => {
  try {
    const polls = await Poll.find({ isActive: true });

    res.status(200).json(polls);

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// 🗳 Cast Vote (USER)
exports.votePoll = async (req, res) => {
  try {
    const { pollId, selectedOptionIndex } = req.body;

    // 1️⃣ Check poll exists
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // 2️⃣ Check poll is active
    if (!poll.isActive) {
      return res.status(400).json({ message: "Poll is not active" });
    }

    // 3️⃣ Check if user already voted
    const existingVote = await Vote.findOne({
      userId: req.user.id,
      pollId: pollId
    });

    if (existingVote) {
      return res.status(400).json({ message: "You have already voted in this poll" });
    }

    // 4️⃣ Validate option index
    if (
      selectedOptionIndex < 0 ||
      selectedOptionIndex >= poll.options.length
    ) {
      return res.status(400).json({ message: "Invalid option selected" });
    }

    // 5️⃣ Increment vote count
    poll.options[selectedOptionIndex].votes += 1;
    await poll.save();

    // 6️⃣ Save vote record
    const newVote = new Vote({
      userId: req.user.id,
      pollId: pollId,
      selectedOptionIndex
    });

    await newVote.save();

    res.status(200).json({ message: "Vote cast successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// 📊 Get Poll Results
exports.getPollResults = async (req, res) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json({
      question: poll.question,
      options: poll.options
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};