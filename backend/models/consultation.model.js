const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const consultationSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  diagnostic: {
    type: String,
    required: true
  },
  traitement: {
    type: String
  },
  notes: {
    type: String
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true
  },
  dme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DME',
    required: true
  }
});
consultationSchema.plugin(AutoIncrement, { inc_field: 'consultationId', parallel_hooks: false });

module.exports = mongoose.model('Consultation', consultationSchema);
