const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const utilisateurSchema = new mongoose.Schema({
  utilisateurId: { type: Number, unique: true },
  nom:           { type: String, required: true },
  prenom:        { type: String, required: true },
  email:         { type: String, required: true, unique: true },
  mot_de_passe:  { type: String, required: true },
  role:          { type: String, enum: ['admin','patient','medecin','infirmier','laboratoire'], required: true },
  statut:        { type: String, enum: ['actif', 'archive'], default: 'actif' },
  resetToken:    { type: String },
  resetTokenExpiry: { type: Date }
}, {
  timestamps: true,
  discriminatorKey: 'role'
});

utilisateurSchema.methods.verifierMotDePasse = async function(motDePasse) {
  return bcrypt.compare(motDePasse, this.mot_de_passe);
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);
module.exports = Utilisateur;