const Utilisateur = require('./utilisateur.model');
const mongoose = require('mongoose');

const Laboratoire = Utilisateur.discriminator('laboratoire', new mongoose.Schema({
  nomLab: { type: String }
}));
module.exports = Laboratoire;