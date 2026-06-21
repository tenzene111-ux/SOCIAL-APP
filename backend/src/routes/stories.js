const express = require('express');
const Story = require('../models/Story');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const following = [...req.user.following, req.user._id];
    const stories = await Story.find({ author: { $in: following }, expiresAt: { $gt: new Date() } })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 });

    const grouped = stories.reduce((acc, story) => {
      const key = story.author._id.toString();
      if (!acc[key]) acc[key] = { user: story.author, stories: [] };
      acc[key].stories.push(story);
      return acc;
    }, {});
    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { text, backgroundColor } = req.body;
    const media = req.file ? { url: `/uploads/${req.file.filename}`, type: req.file.mimetype.startsWith('video') ? 'video' : 'image' } : undefined;
    const story = await Story.create({ author: req.user._id, media, text, backgroundColor });
    await story.populate('author', 'username fullName avatar');
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/view', auth, async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/react', auth, async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, { $push: { reactions: { user: req.user._id, emoji: req.body.emoji } } }, { new: true });
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
