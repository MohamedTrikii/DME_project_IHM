const express = require('express');
const router = express.Router();
const DemandeAnalyse = require('../models/demandeAnalyse.model');
const DME = require('../models/dme.model');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// POST /api/analyse - Créer une demande d'analyse
router.post('/', authMiddleware, roleMiddleware('medecin', 'admin'), async (req, res) => {
  try {
    const { typeAnalyse, description, dmeId, patientId } = req.body;

    if (!typeAnalyse || !dmeId || !patientId) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const dme = await DME.findById(dmeId);
    if (!dme) {
      return res.status(404).json({ message: 'DME non trouvé' });
    }

    const demande = new DemandeAnalyse({
      typeAnalyse: typeAnalyse.trim(),
      description: description?.trim(),
      medecin: req.user.id,
      patient: patientId,
      dme: dmeId
    });

    await demande.save();

    // Ajouter la demande au DME
    await DME.findByIdAndUpdate(dmeId, { $push: { demandes: demande._id } });

    res.status(201).json(demande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analyse - Obtenir les demandes d'analyse (filtrées par rôle)
router.get('/', authMiddleware, roleMiddleware('medecin', 'admin', 'laboratoire', 'patient'), async (req, res) => {
  try {
    let query = {};
    const userRole = req.user.role;

    // Filtrer selon le rôle
    if (userRole === 'patient') {
      query.patient = req.user.id;
    } else if (userRole === 'medecin') {
      query.medecin = req.user.id;
    } else if (userRole === 'laboratoire') {
      query.$or = [
        { laboratoire: req.user.id },
        { statut: 'en attente' }
      ];
    }
    // admin voit tout

    const demandes = await DemandeAnalyse.find(query)
      .populate('dme')
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom')
      .populate('laboratoire', 'nom prenom')
      .sort({ dateDemande: -1 });

    res.json(demandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analyse/:id - Obtenir une demande spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const demande = await DemandeAnalyse.findById(req.params.id)
      .populate('dme')
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom')
      .populate('laboratoire', 'nom prenom');

    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    // Vérifier les permissions
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === 'patient' && demande.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(demande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/analyse/:id - Mettre à jour le statut
router.put('/:id', authMiddleware, roleMiddleware('laboratoire', 'admin'), async (req, res) => {
  try {
    const { statut } = req.body;
    const updateData = { statut };

    if (req.user.role === 'laboratoire') {
      updateData.laboratoire = req.user.id;
    }

    const demande = await DemandeAnalyse.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    res.json(demande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
