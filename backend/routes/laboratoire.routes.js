const express = require('express');
const router = express.Router();
const laboratoireController = require('../controllers/laboratoire.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// GET /api/laboratoire/stats - Dashboard stats
router.get('/stats', authMiddleware, roleMiddleware('laboratoire', 'admin'), laboratoireController.getDashboardStats);

// GET /api/laboratoire/demandes - Voir les demandes en attente
router.get('/demandes', authMiddleware, roleMiddleware('laboratoire', 'admin'), laboratoireController.voirDemande);

// GET /api/laboratoire/demandes/all - Voir toutes les demandes
router.get('/demandes/all', authMiddleware, roleMiddleware('laboratoire', 'admin'), laboratoireController.voirToutesDemandes);

// PUT /api/laboratoire/demandes/:id/status - Mettre à jour le statut d'une demande
router.put('/demandes/:id/status', authMiddleware, roleMiddleware('laboratoire', 'admin'), laboratoireController.updateStatut);

// POST /api/laboratoire/resultats - Ajouter un résultat
router.post('/resultats', authMiddleware, roleMiddleware('laboratoire', 'admin'), laboratoireController.ajouterResultat);

// GET /api/laboratoire/resultats - Voir les résultats du laboratoire
router.get('/resultats', authMiddleware, roleMiddleware('laboratoire', 'admin'), laboratoireController.voirResultats);

module.exports = router;
