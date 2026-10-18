const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  try {
    const { designation, mainFeedback, detailedExperience, consentToDisplay, anonymous } = req.body;

    if (!mainFeedback) return res.status(400).json({ message: 'Main feedback is required' });

    const feedback = await Feedback.create({
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      designation: designation || '',
      mainFeedback,
      detailedExperience: detailedExperience || '',
      consentToDisplay: consentToDisplay || false,
      anonymous: anonymous || false,
      memberSince: req.user.createdAt,
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

const getPublicFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ consentToDisplay: true }).sort({ createdAt: -1 });

        const sanitized = feedbacks.map(f => ({
            mainFeedback: f.mainFeedback,
            detailedExperience: f.detailedExperience,
            designation: f.designation,
            memberSince: f.memberSince,
            createdAt: f.createdAt,
            anonymous: f.anonymous,
            name: f.anonymous ? 'Anonymous' : f.name,
    }));

    res.status(200).json(sanitized);
    } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback' });
    }
};

module.exports = {submitFeedback, getPublicFeedback}