const Utilisateur = require('./utilisateur.model');
const mongoose = require('mongoose');
const Infirmier = Utilisateur.discriminator('infirmier', new mongoose.Schema({
  service: { type: String }
}));
module.exports = Infirmier;