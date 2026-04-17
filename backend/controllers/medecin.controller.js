const Patient        = require('../models/patient.model');
const DME            = require('../models/dme.model');
const Consultation   = require('../models/consultation.model');
const Ordonnance     = require('../models/ordonnance.model');
const DemandeAnalyse = require('../models/demandeAnalyse.model');
const Resultat       = require('../models/resultat.model');
const bcrypt         = require('bcrypt');
const { sendSuccess, handleError } = require('../utils/response');

// ✅ Dashboard Stats for Medecin
exports.getDashboardStats = async (req, res) => {
  try {
    const medecinId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get counts in parallel
    const [
      totalPatients,
      consultationsToday,
      totalConsultations,
      pendingAnalyses,
      recentConsultations,
      recentOrdonnances
    ] = await Promise.all([
      Patient.countDocuments(),
      Consultation.countDocuments({ medecin: medecinId, date: { $gte: today } }),
      Consultation.countDocuments({ medecin: medecinId }),
      DemandeAnalyse.countDocuments({ medecin: medecinId, statut: 'en attente' }),
      Consultation.find({ medecin: medecinId })
        .sort({ date: -1 })
        .limit(5)
        .populate('patient', 'nom prenom')
        .lean(),
      Ordonnance.find({ medecin: medecinId })
        .sort({ date: -1 })
        .limit(5)
        .populate('patient', 'nom prenom')
        .lean()
    ]);

    return sendSuccess(res, 200, 'Dashboard stats', {
      stats: {
        totalPatients,
        consultationsToday,
        totalConsultations,
        pendingAnalyses
      },
      recentConsultations,
      recentOrdonnances
    });
  } catch (err) {
    handleError(err, res);
  }
};

// ✅ Get all patients for medecin
exports.getPatients = async (req, res) => {
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

// ✅ 1. Ajouter Patient + DME
exports.ajouterPatient = async (req, res, next) => {
  try {
    const { nom, prenom, email, mot_de_passe, dateNais, adresse, telephone } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe) {
      return res.status(400).json({ message: 'Nom, prenom, email et mot_de_passe sont requis' });
    }

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const utilisateurId  = Date.now();

    const patient = new Patient({
      nom, prenom, email,
      mot_de_passe: hashedPassword,
      dateNais, adresse, telephone,
      utilisateurId
    });

    const dme = new DME({
      patient: patient._id,
      statut: 'actif',
      accesAutorise: [req.user.id]
    });

    await dme.save();
    patient.dme = dme._id;
    await patient.save();

    res.status(201).json({ message: 'Patient et DME créés', patient, dme });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ✅ 2. Créer Consultation
exports.creerConsultation = async (req, res, next) => {
  try {
    const { patientId, diagnostic, traitement, notes, date } = req.body;

    if (!patientId || !diagnostic) {
      return res.status(400).json({ message: 'patientId et diagnostic sont requis' });
    }

    const dme = await DME.findOne({ patient: patientId });
    if (!dme) {
      return res.status(404).json({ message: 'DME non trouvé pour ce patient' });
    }

    const consultation = new Consultation({
      medecin:    req.user.id,
      patient:    patientId,
      dme:        dme._id,
      diagnostic,
      traitement,
      notes,
      date:       date || new Date()
    });

    await consultation.save();

    await DME.findOneAndUpdate(
      { patient: patientId },
      { $push: { consultations: consultation._id } },
      { returnDocument: 'after' }
    );

    res.status(201).json({ message: 'Consultation créée', consultation });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ✅ 3. Créer Ordonnance
exports.creerOrdonnance = async (req, res, next) => {
  try {
    const { patientId, medicament, posologie, duree, dateLimite } = req.body;

    if (!patientId || !medicament) {
      return res.status(400).json({ message: 'patientId et medicament sont requis' });
    }

    const dme = await DME.findOne({ patient: patientId });
    if (!dme) {
      return res.status(404).json({ message: 'DME non trouve pour ce patient' });
    }

    const ordonnance = new Ordonnance({
      medicament,
      posologie,
      duree,
      dateLimite: dateLimite || null,
      date:       new Date(),
      medecin:    req.user.id,
      patient:    patientId,
      dme:        dme._id
    });

    await ordonnance.save();

    await DME.findOneAndUpdate({ patient: patientId }, { $push: { ordonnances: ordonnance._id } }, { returnDocument: 'after' });

    res.status(201).json({ message: 'Ordonnance créée', ordonnance });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ✅ 4. Créer Demande Analyse
exports.creerDemande = async (req, res, next) => {
  try {
    const { patientId, typeAnalyse, description } = req.body;

    if (!patientId || !typeAnalyse) {
      return res.status(400).json({ message: 'patientId et typeAnalyse sont requis' });
    }

    const dme = await DME.findOne({ patient: patientId });
    if (!dme) {
      return res.status(404).json({ message: 'DME non trouve pour ce patient' });
    }

    const demande = new DemandeAnalyse({
      typeAnalyse,
      description,
      statut:      'en attente',
      dateDemande: new Date(),
      medecin:     req.user.id,
      patient:     patientId,
      dme:         dme._id
    });

    await demande.save();

    await DME.findOneAndUpdate({ patient: patientId }, { $push: { demandes: demande._id } }, { returnDocument: 'after' });

    res.status(201).json({ message: 'Demande créée', demande });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ✅ 5. Voir DME du patient
exports.voirDME = async (req, res, next) => {
  try {
    const dme = await DME.findOne({ patient: req.params.id })
      .populate('patient',       'nom prenom email dateNais telephone')
      .populate('consultations')
      .populate('ordonnances')
      .populate('demandes')
      .populate('resultats')
      .populate('observations')
      .populate('accesAutorise', 'nom prenom email role');

    if (!dme) return res.status(404).json({ message: 'DME non trouvé' });
    res.status(200).json(dme);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ✅ 6. Consulter un patient
exports.getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).select('-mot_de_passe');

    if (!patient) {
      return res.status(404).json({ message: 'Patient non trouve' });
    }

    res.status(200).json(patient);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// ✅ 7. Modifier un patient
exports.updatePatient = async (req, res, next) => {
  try {
    const { nom, prenom, email, dateNais, adresse, telephone } = req.body;

    if (!nom || !prenom || !email) {
      return res.status(400).json({ message: 'Nom, prenom et email sont requis' });
    }

    const existing = await Patient.findOne({ email, _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({ message: 'Email deja utilise' });
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        nom,
        prenom,
        email,
        dateNais: dateNais || null,
        adresse: adresse || '',
        telephone: telephone || ''
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-mot_de_passe');

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient non trouve' });
    }

    res.status(200).json({ message: 'Patient modifie', patient: updatedPatient });
  } catch (err) {
    console.error(err);
    next(err);
  }
};