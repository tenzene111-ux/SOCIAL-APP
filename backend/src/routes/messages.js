const express = require('express');
const { Message, Conversation } = require('../models/Message');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username fullName avatar online lastSeen')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/conversations', auth, async (req, res) => {
  try {
    const { participantId, isGroup, groupName, participants } = req.body;

    if (!isGroup) {
      const existing = await Conversation.findOne({
        isGroup: false,
        participants: { $all: [req.user._id, participantId], $size: 2 }
      }).populate('participants', 'username fullName avatar online');
      if (existing) return res.json(existing);
    }

    const allParticipants = isGroup ? [req.user._id, ...participants] : [req.user._id, participantId];
    const conversation = await Conversation.create({
      participants: allParticipants, isGroup, groupName, admin: req.user._id
    });
    await conversation.populate('participants', 'username fullName avatar online');
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:conversationId', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('replyTo');
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:conversationId', auth, upload.single('media'), async (req, res) => {
  try {
    const { text, replyTo } = req.body;
    const media = req.file ? { url: `/uploads/${req.file.filename}`, type: req.file.mimetype.startsWith('image') ? 'image' : 'video' } : undefined;

    const message = await Message.create({
      conversation: req.params.conversationId, sender: req.user._id, text, media, replyTo, readBy: [req.user._id]
    });
    await Conversation.findByIdAndUpdate(req.params.conversationId, { lastMessage: message._id });
    await message.populate('sender', 'username avatar');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/message/:id', auth, async (req, res) => {
  try {
    await Message.findOneAndUpdate({ _id: req.params.id, sender: req.user._id }, { isDeleted: true, text: 'This message was deleted' });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
