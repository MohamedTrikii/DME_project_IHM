const Utilisateur = require('./utilisateur.model');
const mongoose = require('mongoose');

const Patient = Utilisateur.discriminator('patient', new mongoose.Schema({
  dateNais:  { type: Date },
  adresse:   { type: String },
  telephone: { type: String },
  dme:       { type: mongoose.Schema.Types.ObjectId, ref: 'DME' }
}));


module.exports = Patient;