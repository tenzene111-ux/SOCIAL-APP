const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/search', auth, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    }).select('username fullName avatar isVerified').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 }).populate('author', 'username fullName avatar isVerified');
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ error: 'Cannot follow yourself' });

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).json({ error: 'User not found' });

    const isFollowing = req.user.following.includes(req.params.id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } });
      await Notification.create({ recipient: req.params.id, sender: req.user._id, type: 'follow' });
    }
    res.json({ following: !isFollowing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile', auth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverPhoto', maxCount: 1 }]), async (req, res) => {
  try {
    const updates = {};
    const allowed = ['fullName', 'bio', 'website', 'location', 'isPrivate'];
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    if (req.files?.avatar) updates.avatar = `/uploads/${req.files.avatar[0].filename}`;
    if (req.files?.coverPhoto) updates.coverPhoto = `/uploads/${req.files.coverPhoto[0].filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/block', auth, async (req, res) => {
  try {
    const isBlocked = req.user.blockedUsers.includes(req.params.id);
    if (isBlocked) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: req.params.id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { blockedUsers: req.params.id }, $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    }
    res.json({ blocked: !isBlocked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:username/saved', auth, async (req, res) => {
  try {
    const posts = await Post.find({ saves: req.user._id }).sort({ createdAt: -1 }).populate('author', 'username fullName avatar isVerified');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
