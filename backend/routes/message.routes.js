const express = require('express');
const router = express.Router();

const Message = require('../models/message.model');
const Utilisateur = require('../models/utilisateur.model');
const authMiddleware = require('../middleware/auth.middleware');




// 📇 Liste des contacts pour la messagerie (doit être avant /:userId)
router.get('/contacts', authMiddleware, async (req, res) => {
  console.log('Incoming request to /api/messages/contacts');
  console.log('User from token:', req.user);
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let filter = {};
    if (userRole === 'patient') {
      filter = { role: 'medecin', _id: { $ne: userId }, statut: 'actif' };
    } else if (userRole === 'medecin') {
      filter = { role: 'patient', _id: { $ne: userId }, statut: 'actif' };
    } else {
      // Pour les autres rôles, retourner tous sauf soi-même
      filter = { _id: { $ne: userId }, statut: 'actif' };
    }
    const contacts = await Utilisateur.find(filter).select('-mot_de_passe -resetToken -resetTokenExpiry');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
