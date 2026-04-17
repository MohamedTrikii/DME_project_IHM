const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.post('/users/create',            authMiddleware, adminMiddleware, adminController.ajouterUtilisateur);
router.get('/users',              authMiddleware, adminMiddleware, adminController.listerUtilisateurs);
router.get('/users/:id',          authMiddleware, adminMiddleware, adminController.getUtilisateurById);
router.put('/users/:id',          authMiddleware, adminMiddleware, adminController.modifierUtilisateur);
router.delete('/users/:id',      authMiddleware, adminMiddleware, adminController.supprimerUtilisateur);
router.get('/logs',              authMiddleware, adminMiddleware, adminController.consulterLog);
router.put('/users/:id/archive', authMiddleware, adminMiddleware, adminController.archiver);
router.get('/stats',             authMiddleware, adminMiddleware, adminController.getStats);
router.get('/export',            authMiddleware, adminMiddleware, adminController.exportData);

module.exports = router;