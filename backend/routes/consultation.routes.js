const express = require('express');
const router = express.Router();
const Consultation = require('../models/consultation.model');
const DME = require('../models/dme.model');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// POST /api/consultation - Créer une consultation
router.post('/', authMiddleware, roleMiddleware('medecin', 'admin'), async (req, res) => {
  try {
    const { diagnostic, traitement, notes, dmeId, patientId, date } = req.body;

    if (!diagnostic || !dmeId || !patientId) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const dme = await DME.findById(dmeId);
    if (!dme) {
      return res.status(404).json({ message: 'DME non trouvé' });
    }

    const consultation = new Consultation({
      diagnostic: diagnostic.trim(),
      traitement: traitement?.trim(),
      notes: notes?.trim(),
      date: date || new Date(),
      medecin: req.user.id,
      patient: patientId,
      dme: dmeId
    });

    await consultation.save();

    // Ajouter la consultation au DME
    await DME.findByIdAndUpdate(dmeId, { $push: { consultations: consultation._id } });

    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/consultation - Obtenir les consultations (filtrées par rôle)
router.get('/', authMiddleware, roleMiddleware('medecin', 'admin', 'patient', 'infirmier'), async (req, res) => {
  try {
    let query = {};
    const userRole = req.user.role;

    // Filtrer selon le rôle
    if (userRole === 'patient') {
      query.patient = req.user.id;
    } else if (userRole === 'medecin') {
      query.medecin = req.user.id;
    } else if (userRole === 'infirmier') {
      // L'infirmier voit les consultations des patients auxquels il a accès
      const dmes = await DME.find({ accesAutorise: req.user.id }).select('_id');
      query.dme = { $in: dmes.map(d => d._id) };
    }
    // admin voit tout

    const consultations = await Consultation.find(query)
      .populate('dme')
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom')
      .sort({ date: -1 });

    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/consultation/:id - Obtenir une consultation spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('dme')
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }

    // Vérifier les permissions
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === 'patient' && consultation.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/consultation/:id - Mettre à jour une consultation
router.put('/:id', authMiddleware, roleMiddleware('medecin', 'admin'), async (req, res) => {
  try {
    const { diagnostic, traitement, notes } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation non trouvée' });
    }

    // Seul le médecin qui a créé peut modifier (sauf admin)
    if (req.user.role !== 'admin' && consultation.medecin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette consultation' });
    }

    const updated = await Consultation.findByIdAndUpdate(
      req.params.id,
      { diagnostic, traitement, notes },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
