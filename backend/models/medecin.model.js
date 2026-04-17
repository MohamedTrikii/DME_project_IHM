const Utilisateur = require('./utilisateur.model');
const mongoose = require('mongoose');

const Medecin = Utilisateur.discriminator('medecin', new mongoose.Schema({
  specialite: { type: String },
  adresse:    { type: String }
}));
module.exports = Medecin;