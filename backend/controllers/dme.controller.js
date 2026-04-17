const DME = require('../models/dme.model');
const Patient = require('../models/patient.model');
const { sendSuccess, sendError, handleError } = require('../utils/response');

// Helper — deep-populate all DME sub-documents
const fullPopulate = (query) =>
  query
    .populate('patient', 'nom prenom email dateNais telephone adresse')
    .populate('accesAutorise', 'nom prenom email role')
    .populate({ path: 'consultations', populate: { path: 'medecin', select: 'nom prenom' } })
    .populate({ path: 'ordonnances',   populate: { path: 'medecin', select: 'nom prenom' } })
    .populate({ path: 'demandes',      populate: { path: 'medecin', select: 'nom prenom' } })
    .populate('observations')
    .populate('resultats');


// ── 1. Get all DMEs ──────────────────────────────────────────
exports.getAllDME = async (req, res) => {
  try {
    const dmes = await DME.find()
      .populate('patient', 'nom prenom email dateNais')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Liste des DMEs', dmes);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 2. Create DME (for an existing patient) ──────────────────
exports.createDME = async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) return sendError(res, 400, 'patientId requis');

    const patient = await Patient.findById(patientId);
    if (!patient) return sendError(res, 404, 'Patient non trouvé');

    const existing = await DME.findOne({ patient: patientId });
    if (existing) return sendError(res, 409, 'Un DME existe déjà pour ce patient');

    const dme = new DME({ patient: patientId });
    await dme.save();

    // Keep bidirectional reference on patient
    await Patient.findByIdAndUpdate(patientId, { dme: dme._id });

    const populated = await fullPopulate(DME.findById(dme._id));
    return sendSuccess(res, 201, 'DME créé avec succès', populated);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 3. Get DME by ID ─────────────────────────────────────────
exports.getDMEById = async (req, res) => {
  try {
    const dme = await fullPopulate(DME.findById(req.params.id));
    if (!dme) return sendError(res, 404, 'DME non trouvé');
    return sendSuccess(res, 200, 'DME trouvé', dme);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 4. Get DME by patient ID ─────────────────────────────────
exports.getDMEByPatient = async (req, res) => {
  try {
    const dme = await fullPopulate(DME.findOne({ patient: req.params.patientId }));
    if (!dme) return sendError(res, 404, 'DME non trouvé pour ce patient');
    return sendSuccess(res, 200, 'DME trouvé', dme);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 5. Update DME (statut) ───────────────────────────────────
exports.updateDME = async (req, res) => {
  try {
    const { statut } = req.body;
    const updates = {};
    if (statut) updates.statut = statut;

    const dme = await DME.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('patient', 'nom prenom email');
    if (!dme) return sendError(res, 404, 'DME non trouvé');
    return sendSuccess(res, 200, 'DME mis à jour', dme);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 6. Grant access to a médecin ────────────────────────────
exports.grantAccess = async (req, res) => {
  try {
    const { medecinId } = req.body;
    if (!medecinId) return sendError(res, 400, 'medecinId requis');

    const dme = await DME.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { accesAutorise: medecinId } },
      { new: true }
    ).populate('accesAutorise', 'nom prenom email role');

    if (!dme) return sendError(res, 404, 'DME non trouvé');
    return sendSuccess(res, 200, 'Accès accordé', dme);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 7. Revoke access from a médecin ─────────────────────────
exports.revokeAccess = async (req, res) => {
  try {
    const dme = await DME.findByIdAndUpdate(
      req.params.id,
      { $pull: { accesAutorise: req.params.medecinId } },
      { new: true }
    ).populate('accesAutorise', 'nom prenom email role');

    if (!dme) return sendError(res, 404, 'DME non trouvé');
    return sendSuccess(res, 200, 'Accès révoqué', dme);
  } catch (err) {
    handleError(err, res);
  }
};


// ── 8. Delete DME ────────────────────────────────────────────
exports.deleteDME = async (req, res) => {
  try {
    const dme = await DME.findByIdAndDelete(req.params.id);
    if (!dme) return sendError(res, 404, 'DME non trouvé');
    return sendSuccess(res, 200, 'DME supprimé');
  } catch (err) {
    handleError(err, res);
  }
};
