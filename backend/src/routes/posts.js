const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const following = [...req.user.following, req.user._id];
    const posts = await Post.find({ author: { $in: following }, visibility: { $ne: 'private' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatar isVerified')
      .populate('comments.user', 'username avatar')
      .populate('originalPost');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/explore', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const posts = await Post.find({ visibility: 'public' })
      .sort({ likes: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'username fullName avatar isVerified');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, upload.array('media', 10), async (req, res) => {
  try {
    const { content, visibility, location, hashtags } = req.body;
    const media = req.files?.map(f => ({ url: `/uploads/${f.filename}`, type: f.mimetype.startsWith('video') ? 'video' : 'image' })) || [];
    const parsedHashtags = hashtags ? JSON.parse(hashtags) : content?.match(/#\w+/g)?.map(t => t.slice(1)) || [];
    const mentions = content?.match(/@\w+/g)?.map(m => m.slice(1)) || [];

    const post = await Post.create({ author: req.user._id, content, media, visibility, location, hashtags: parsedHashtags });
    await post.populate('author', 'username fullName avatar isVerified');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) {
      post.likes.push(req.user._id);
      if (post.author.toString() !== req.user._id.toString()) {
        await Notification.create({ recipient: post.author, sender: req.user._id, type: 'like', post: post._id });
      }
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    await post.populate('comments.user', 'username avatar');

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({ recipient: post.author, sender: req.user._id, type: 'comment', post: post._id });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) return res.status(404).json({ error: 'Post not found' });

    const repost = await Post.create({ author: req.user._id, content: req.body.content, isRepost: true, originalPost: originalPost._id });
    originalPost.shares.push(req.user._id);
    await originalPost.save();
    await repost.populate('author', 'username fullName avatar isVerified');
    await repost.populate('originalPost');
    res.status(201).json(repost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/save', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const idx = post.saves.indexOf(req.user._id);
    if (idx === -1) post.saves.push(req.user._id);
    else post.saves.splice(idx, 1);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
    if (!post) return res.status(404).json({ error: 'Post not found or unauthorized' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username fullName avatar isVerified')
      .populate('comments.user', 'username avatar')
      .populate('originalPost');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
