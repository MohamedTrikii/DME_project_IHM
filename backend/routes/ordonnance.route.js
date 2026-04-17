const express = require('express');
const router = express.Router();
const Ordonnance = require('../models/ordonnance.model');
const DME = require('../models/dme.model');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// POST /api/ordonnance - Créer une ordonnance
router.post('/', authMiddleware, roleMiddleware('medecin', 'admin'), async (req, res) => {
  try {
    const { medicament, posologie, duree, dateLimite, dmeId, patientId } = req.body;

    if (!medicament || !dmeId || !patientId) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const dme = await DME.findById(dmeId);
    if (!dme) {
      return res.status(404).json({ message: 'DME non trouvé' });
    }

    const ordonnance = new Ordonnance({
      medicament: medicament.trim(),
      posologie: posologie?.trim(),
      duree: duree?.trim(),
      dateLimite,
      medecin: req.user.id,
      patient: patientId,
      dme: dmeId
    });

    await ordonnance.save();

    // Ajouter l'ordonnance au DME
    await DME.findByIdAndUpdate(dmeId, { $push: { ordonnances: ordonnance._id } });

    res.status(201).json(ordonnance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ordonnance - Obtenir les ordonnances (filtrées par rôle)
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
      const dmes = await DME.find({ accesAutorise: req.user.id }).select('_id');
      query.dme = { $in: dmes.map(d => d._id) };
    }
    // admin voit tout

    const ordonnances = await Ordonnance.find(query)
      .populate('dme')
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom')
      .sort({ date: -1 });

    res.json(ordonnances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ordonnance/:id - Obtenir une ordonnance spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const ordonnance = await Ordonnance.findById(req.params.id)
      .populate('dme')
      .populate('patient', 'nom prenom email')
      .populate('medecin', 'nom prenom');

    if (!ordonnance) {
      return res.status(404).json({ message: 'Ordonnance non trouvée' });
    }

    // Vérifier les permissions
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === 'patient' && ordonnance.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(ordonnance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/ordonnance/:id - Supprimer une ordonnance
router.delete('/:id', authMiddleware, roleMiddleware('medecin', 'admin'), async (req, res) => {
  try {
    const ordonnance = await Ordonnance.findById(req.params.id);
    if (!ordonnance) {
      return res.status(404).json({ message: 'Ordonnance non trouvée' });
    }

    // Seul le médecin qui a créé peut supprimer (sauf admin)
    if (req.user.role !== 'admin' && ordonnance.medecin.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await Ordonnance.findByIdAndDelete(req.params.id);

    // Retirer du DME
    await DME.findByIdAndUpdate(ordonnance.dme, { $pull: { ordonnances: ordonnance._id } });

    res.json({ message: 'Ordonnance supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
