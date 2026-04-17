const express = require('express');
const router = express.Router();
const ResultatAnalyse = require('../models/resultat.model');
const DemandeAnalyse = require('../models/demandeAnalyse.model');
const DME = require('../models/dme.model');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// POST /api/resultat - Créer un résultat d'analyse
router.post('/', authMiddleware, roleMiddleware('laboratoire', 'admin'), async (req, res) => {
  try {
    const { resultat, interpretation, demandeId } = req.body;

    if (!resultat || !demandeId) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const demande = await DemandeAnalyse.findById(demandeId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    const nouveauResultat = new ResultatAnalyse({
      resultat: resultat.trim(),
      interpretation: interpretation?.trim(),
      demande: demandeId,
      laboratoire: req.user.id
    });

    await nouveauResultat.save();

    // Mettre à jour le statut de la demande
    await DemandeAnalyse.findByIdAndUpdate(demandeId, { statut: 'termine' });

    // Ajouter le résultat au DME
    await DME.findByIdAndUpdate(demande.dme, { $push: { resultats: nouveauResultat._id } });

    res.status(201).json(nouveauResultat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/resultat - Obtenir les résultats (filtrés par rôle)
router.get('/', authMiddleware, roleMiddleware('laboratoire', 'admin', 'medecin', 'patient'), async (req, res) => {
  try {
    let query = {};
    const userRole = req.user.role;

    if (userRole === 'laboratoire') {
      query.laboratoire = req.user.id;
    } else if (userRole === 'patient' || userRole === 'medecin') {
      // Trouver les demandes du patient ou du médecin
      let demandeQuery = {};
      if (userRole === 'patient') {
        demandeQuery.patient = req.user.id;
      } else {
        demandeQuery.medecin = req.user.id;
      }
      const demandes = await DemandeAnalyse.find(demandeQuery).select('_id');
      query.demande = { $in: demandes.map(d => d._id) };
    }
    // admin voit tout

    const resultats = await ResultatAnalyse.find(query)
      .populate({
        path: 'demande',
        populate: [
          { path: 'dme' },
          { path: 'patient', select: 'nom prenom email' },
          { path: 'medecin', select: 'nom prenom' }
        ]
      })
      .populate('laboratoire', 'nom prenom')
      .sort({ dateResultat: -1 });

    res.json(resultats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/resultat/:id - Obtenir un résultat spécifique
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const resultat = await ResultatAnalyse.findById(req.params.id)
      .populate({
        path: 'demande',
        populate: [
          { path: 'dme' },
          { path: 'patient', select: 'nom prenom email' },
          { path: 'medecin', select: 'nom prenom' }
        ]
      })
      .populate('laboratoire', 'nom prenom');

    if (!resultat) {
      return res.status(404).json({ message: 'Résultat non trouvé' });
    }

    // Vérifier les permissions
    const userRole = req.user.role;
    const userId = req.user.id;
    if (userRole === 'patient' && resultat.demande.patient._id.toString() !== userId) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    res.json(resultat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
