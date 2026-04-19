const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  diagnostic: {
    type: String,
    required: true
  },
  traitement: {
    type: String
  },
  notes: {
    type: String
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  dme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DME',
    required: true
  }
});

module.exports = mongoose.model('Consultation', consultationSchema);