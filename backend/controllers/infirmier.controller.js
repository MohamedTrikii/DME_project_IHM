const DME         = require('../models/dme.model');
const Observation = require('../models/observation.model');
const Patient     = require('../models/patient.model');

// GET /api/infirmier/stats  → getDashboardStats()
exports.getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDmes = await DME.countDocuments();
    const totalObservations = await Observation.countDocuments({ infirmier: req.user.id });
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const observationsToday = await Observation.countDocuments({ infirmier: req.user.id, date: { $gte: todayStart } });

    const recentObservations = await Observation.find({ infirmier: req.user.id })
      .sort({ date: -1 }).limit(5)
      .populate({ path: 'infirmier', select: 'nom prenom' });

    const recentDmes = await DME.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate('patient', 'nom prenom');

    res.status(200).json({
      totalPatients,
      totalDmes,
      totalObservations,
      observationsToday,
      recentObservations,
      recentDmes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/infirmier/dme/:id  → consulterDME()
exports.consulterDME = async (req, res) => {
  try {
    const dme = await DME.findById(req.params.id)
      .populate('patient', 'nom prenom email')
      .populate('observations');

    if (!dme) {
      return res.status(404).json({ message: 'DME non trouve' });
    }

    res.status(200).json(dme);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/infirmier/observations  → ajouterObservation()
exports.ajouterObservation = async (req, res) => {
  try {
    const { dmeId, contenu } = req.body;

    if (!dmeId || !contenu) {
      return res.status(400).json({ message: 'dmeId et contenu sont requis' });
    }

    const obs = await Observation.create({
      contenu,
      infirmier: req.user.id,
      date: new Date()
    });

    const dme = await DME.findByIdAndUpdate(dmeId, {
      $push: { observations: obs._id }
    }, { new: true });

    if (!dme) {
      return res.status(404).json({ message: 'DME non trouve' });
    }

    res.status(201).json(obs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};