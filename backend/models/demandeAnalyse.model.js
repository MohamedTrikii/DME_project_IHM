const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
  typeAnalyse: { type: String, required: true },
  description: { type: String },
  statut: {
    type: String,
    enum: ['en attente', 'en cours', 'termine', 'annule'],
    default: 'en attente'
  },
  dateDemande: { type: Date, default: Date.now },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  laboratoire: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  dme: { type: mongoose.Schema.Types.ObjectId, ref: 'DME', required: true }
});

module.exports = mongoose.model('DemandeAnalyse', demandeSchema);