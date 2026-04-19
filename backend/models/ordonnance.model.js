const mongoose = require('mongoose');

const ordonnanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  medicament: { type: String, required: true },
  posologie: { type: String },
  duree: { type: String },
  dateLimite: { type: Date },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  dme: { type: mongoose.Schema.Types.ObjectId, ref: 'DME', required: true }
});

module.exports = mongoose.model('Ordonnance', ordonnanceSchema);