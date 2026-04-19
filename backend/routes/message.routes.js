const express = require('express');
const router = express.Router();
const Message = require('../models/message.model');
const authMiddleware = require('../middleware/auth.middleware');


// 📥 get messages (conversation)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: myId, to: otherId },
        { from: otherId, to: myId }
      ]
    }).sort({ date: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 📤 send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const message = new Message({
      from: req.user.id,
      to: req.body.to,
      text: req.body.text
    });

    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;