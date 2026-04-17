const Utilisateur = require('./utilisateur.model');
const mongoose = require('mongoose');

// Admin has no extra fields, just extra permissions via role
const Admin = Utilisateur.discriminator('admin', new mongoose.Schema({}));

module.exports = Admin;