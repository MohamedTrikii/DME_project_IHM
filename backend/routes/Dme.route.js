const express = require('express');
const router = express.Router();
const dmeController = require('../controllers/dme.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.get(    '/',                           authMiddleware, roleMiddleware('medecin', 'admin', 'infirmier'),                          dmeController.getAllDME);
router.post(   '/',                           authMiddleware, roleMiddleware('medecin', 'admin'),                                       dmeController.createDME);
router.get(    '/patient/:patientId',         authMiddleware, roleMiddleware('medecin', 'admin', 'patient', 'infirmier'),               dmeController.getDMEByPatient);
router.get(    '/:id',                        authMiddleware, roleMiddleware('medecin', 'admin', 'patient', 'infirmier'),               dmeController.getDMEById);
router.put(    '/:id',                        authMiddleware, roleMiddleware('medecin', 'admin'),                                       dmeController.updateDME);
router.post(   '/:id/access',                 authMiddleware, roleMiddleware('medecin', 'admin', 'patient'),                           dmeController.grantAccess);
router.delete( '/:id/access/:medecinId',      authMiddleware, roleMiddleware('medecin', 'admin', 'patient'),                           dmeController.revokeAccess);
// Pour révocation par patientId (plus simple côté front)
router.delete('/patient/:patientId/revoke/:userId', authMiddleware, roleMiddleware('patient', 'admin'), async (req, res) => {
	// Trouve le DME du patient et retire l'accès à l'utilisateur
	const DME = require('../models/dme.model');
	try {
		const dme = await DME.findOneAndUpdate(
			{ patient: req.params.patientId },
			{ $pull: { accesAutorise: req.params.userId } },
			{ new: true }
		);
		if (!dme) return res.status(404).json({ message: 'DME non trouvé' });
		res.status(200).json({ message: 'Accès révoqué', dme });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
router.delete( '/:id',                        authMiddleware, roleMiddleware('admin'),                                                  dmeController.deleteDME);

module.exports = router;

