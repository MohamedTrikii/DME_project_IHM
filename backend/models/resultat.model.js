const mongoose = require('mongoose');

const resultatSchema = new mongoose.Schema({
  dateResultat: { type: Date, default: Date.now },
  resultat: { type: String, required: true },
  interpretation: { type: String },
  demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeAnalyse', required: true },
  laboratoire: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true }
});

module.exports = mongoose.model('ResultatAnalyse', resultatSchema);