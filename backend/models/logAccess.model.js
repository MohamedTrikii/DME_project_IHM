const mongoose = require('mongoose');

module.exports = mongoose.model('LogAccess', new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' },
  date:        { type: Date, default: Date.now },
  action:      { type: String }
}, { timestamps: true }));