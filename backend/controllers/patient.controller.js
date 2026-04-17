const DME = require('../models/dme.model');
const Patient = require('../models/patient.model');
const Consultation = require('../models/consultation.model');
const Ordonnance = require('../models/ordonnance.model');
const DemandeAnalyse = require('../models/demandeAnalyse.model');
const Resultat = require('../models/resultat.model');
const { sendSuccess, sendError, handleError } = require('../utils/response');

// ✅ Dashboard Stats for Patient
exports.getDashboardStats = async (req, res) => {
  try {
    const patientId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dme = await DME.findOne({ patient: patientId });

    if (!dme) {
      return sendError(res, 404, 'DME non trouvé');
    }

    const [
      totalConsultations,
      totalOrdonnances,
      pendingAnalyses,
      recentConsultations,
      recentOrdonnances
    ] = await Promise.all([
      Consultation.countDocuments({ patient: patientId }),
      Ordonnance.countDocuments({ patient: patientId }),
      DemandeAnalyse.countDocuments({ patient: patientId, statut: 'en attente' }),
      Consultation.find({ patient: patientId })
        .sort({ date: -1 })
        .limit(5)
        .populate('medecin', 'nom prenom')
        .lean(),
      Ordonnance.find({ patient: patientId })
        .sort({ date: -1 })
        .limit(5)
        .populate('medecin', 'nom prenom')
        .lean()
    ]);

    return sendSuccess(res, 200, 'Dashboard stats', {
      stats: {
        totalConsultations,
        totalOrdonnances,
        pendingAnalyses,
        dmeStatus: dme.statut || 'actif'
      },
      recentConsultations,
      recentOrdonnances
    });
  } catch (err) {
    handleError(err, res);
  }
};

// GET /api/patient  -> listerPatients()
exports.listerPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? {
          $or: [
            { nom: { $regex: search, $options: 'i' } },
            { prenom: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .select('-mot_de_passe')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean(),
      Patient.countDocuments(query)
    ]);

    return sendSuccess(res, 200, 'Liste des patients', {
      patients,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    handleError(err, res);
  }
};

// GET /api/patient/:id  -> getPatientById()
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).select('-mot_de_passe');
    if (!patient) {
      return sendError(res, 404, 'Patient non trouvé');
    }

    return sendSuccess(res, 200, 'Patient trouvé', patient);
  } catch (err) {
    handleError(err, res);
  }
};

// PUT /api/patient/:id -> updatePatient()
exports.updatePatient = async (req, res) => {
  try {
    const allowedFields = ['nom', 'prenom', 'email', 'dateNais', 'adresse', 'telephone'];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, 'Aucune donnée à mettre à jour');
    }

    if (updates.email) {
      const conflict = await Patient.findOne({
        email: updates.email,
        _id: { $ne: req.params.id }
      });

      if (conflict) {
        return sendError(res, 409, 'Email déjà utilisé');
      }
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-mot_de_passe');

    if (!patient) {
      return sendError(res, 404, 'Patient non trouvé');
    }

    return sendSuccess(res, 200, 'Patient modifié', patient);
  } catch (err) {
    handleError(err, res);
  }
};

// GET /api/patient/:id/dme  → consulterDME()
exports.consulterDME = async (req, res) => {
  try {
    const dme = await DME.findOne({ patient: req.params.id })
      .populate('accesAutorise', 'nom prenom email role')
      .populate('observations')
      .populate('ordonnances')
      .populate('consultations');

    if (!dme) {
      return sendError(res, 404, 'DME non trouvé pour ce patient');
    }

    return sendSuccess(res, 200, 'DME trouvé', dme);
  } catch (err) {
    handleError(err, res);
  }
};

// PUT /api/patient/:id/access  → donnerAcces()
exports.donnerAcces = async (req, res) => {
  try {
    const { medecinId } = req.body;

    if (!medecinId) {
      return sendError(res, 400, 'medecinId requis');
    }

    const dme = await DME.findOneAndUpdate(
      { patient: req.params.id },
      { $addToSet: { accesAutorise: medecinId } },
      { new: true }
    );

    if (!dme) {
      return sendError(res, 404, 'DME non trouvé');
    }

    return sendSuccess(res, 200, 'Accès accordé', dme);
  } catch (err) {
    handleError(err, res);
  }
};

// GET patient consultations
exports.getConsultations = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [consultations, total] = await Promise.all([
      Consultation.find({ patient: patientId })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 })
        .populate('medecin', 'nom prenom')
        .lean(),
      Consultation.countDocuments({ patient: patientId })
    ]);

    return sendSuccess(res, 200, 'Consultations', {
      consultations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    handleError(err, res);
  }
};

// GET patient ordonnances
exports.getOrdonnances = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [ordonnances, total] = await Promise.all([
      Ordonnance.find({ patient: patientId })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ date: -1 })
        .populate('medecin', 'nom prenom')
        .lean(),
      Ordonnance.countDocuments({ patient: patientId })
    ]);

    return sendSuccess(res, 200, 'Ordonnances', {
      ordonnances,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    handleError(err, res);
  }
};

// GET patient analyses
exports.getAnalyses = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      DemandeAnalyse.find({ patient: patientId })
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ dateDemande: -1 })
        .populate('medecin', 'nom prenom')
        .lean(),
      DemandeAnalyse.countDocuments({ patient: patientId })
    ]);

    return sendSuccess(res, 200, 'Analyses', {
      analyses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    handleError(err, res);
  }
};