const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// Patient's own dashboard/data
router.get('/dashboard/stats', authMiddleware, roleMiddleware('patient'), patientController.getDashboardStats);
router.get('/me/consultations', authMiddleware, roleMiddleware('patient'), patientController.getConsultations);
router.get('/me/ordonnances', authMiddleware, roleMiddleware('patient'), patientController.getOrdonnances);
router.get('/me/analyses', authMiddleware, roleMiddleware('patient'), patientController.getAnalyses);

// Admin/Medecin access to patients
router.get('/',          authMiddleware, roleMiddleware('admin', 'medecin'), patientController.listerPatients);
router.get('/:id',         authMiddleware, roleMiddleware('admin', 'medecin'), patientController.getPatientById);
router.put('/:id',         authMiddleware, roleMiddleware('admin', 'medecin'), patientController.updatePatient);
router.get('/:id/dme',    authMiddleware, roleMiddleware('patient', 'admin', 'medecin'), patientController.consulterDME);
router.put('/:id/access', authMiddleware, roleMiddleware('patient', 'admin'), patientController.donnerAcces);

module.exports = router;