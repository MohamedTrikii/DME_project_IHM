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
router.delete( '/:id',                        authMiddleware, roleMiddleware('admin'),                                                  dmeController.deleteDME);

module.exports = router;

