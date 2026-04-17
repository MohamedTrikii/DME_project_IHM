const mongoose = require('mongoose');

const dmeSchema = new mongoose.Schema({
  dmeId:         { type: String, unique: true, sparse: true },
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  dateCreation:  { type: Date, default: Date.now },
  statut:        { type: String, default: 'actif', enum: ['actif', 'inactif', 'archivé'] },
  accesAutorise: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur' }],
  observations:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Observation' }],
  ordonnances:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ordonnance' }],
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }],
  demandes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'DemandeAnalyse' }],
  resultats:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'ResultatAnalyse' }]
}, { timestamps: true });

// Auto-generate human-readable DME ID before first save
dmeSchema.pre('save', async function () {
  if (!this.dmeId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('DME').countDocuments();
    this.dmeId = `DME-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('DME', dmeSchema);