const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  contenu: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  infirmier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  }
});

module.exports = mongoose.model('Observation', observationSchema);
