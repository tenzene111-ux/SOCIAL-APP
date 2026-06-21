const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: { url: String, type: { type: String, enum: ['image', 'video'] } },
  text: String,
  backgroundColor: String,
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, emoji: String }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
}, { timestamps: true });

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Story', storySchema);
