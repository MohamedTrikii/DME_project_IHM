const express = require('express');
const router = express.Router();
const medecinController = require('../controllers/medecin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Dashboard
router.get('/dashboard/stats', authMiddleware, roleMiddleware('medecin'), medecinController.getDashboardStats);

// Patients
router.get('/patients', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.getPatients);
router.post('/patients', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.ajouterPatient);
router.get('/patients/:id', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.getPatientById);
router.put('/patients/:id', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.updatePatient);
router.get('/patients/:id/dme', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.voirDME);

// Consultations & Ordonnances
router.post('/consultations', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.creerConsultation);
router.post('/ordonnances', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.creerOrdonnance);
router.post('/demandes', authMiddleware, roleMiddleware('medecin', 'admin'), medecinController.creerDemande);

module.exports = router;