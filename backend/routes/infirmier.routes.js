const express = require('express');
const router = express.Router();
const infirmierController = require('../controllers/infirmier.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.get('/stats', authMiddleware, roleMiddleware('infirmier', 'admin'), infirmierController.getDashboardStats);
router.get('/dme/:id', authMiddleware, roleMiddleware('infirmier', 'admin'), infirmierController.consulterDME);
router.post('/observations', authMiddleware, roleMiddleware('infirmier', 'admin'), infirmierController.ajouterObservation);

module.exports = router;
