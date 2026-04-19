const Message = require('../models/message.model');

// 📤 envoyer message
exports.sendMessage = async (req, res) => {
  try {
    const message = await Message.create({
      from: req.user.id, // 🔥 يجي من token
      to: req.body.to,
      text: req.body.text
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📥 récupérer messages (chat)
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId }
      ]
    }).sort({ date: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};