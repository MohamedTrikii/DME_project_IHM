const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utilisateur',
    required: true
  },
  to: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Utilisateur',
    required: true
  },
  text: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Message', messageSchema);