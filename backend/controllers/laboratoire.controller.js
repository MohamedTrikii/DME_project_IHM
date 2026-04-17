const DemandeAnalyse  = require('../models/demandeAnalyse.model');
const ResultatAnalyse = require('../models/resultat.model');
const DME = require('../models/dme.model');

// GET /api/laboratoire/stats  → getDashboardStats()
exports.getDashboardStats = async (req, res) => {
  try {
    const demandesEnAttente = await DemandeAnalyse.countDocuments({ statut: 'en attente' });
    const totalDemandes = await DemandeAnalyse.countDocuments();
    const totalResultats = await ResultatAnalyse.countDocuments({ laboratoire: req.user.id });
    const demandesTerminees = await DemandeAnalyse.countDocuments({ statut: 'termine' });

    const recentDemandes = await DemandeAnalyse.find()
      .sort({ dateDemande: -1 }).limit(5)
      .populate('patient', 'nom prenom')
      .populate('medecin', 'nom prenom');

    const recentResultats = await ResultatAnalyse.find({ laboratoire: req.user.id })
      .sort({ dateResultat: -1 }).limit(5)
      .populate({ path: 'demande', populate: { path: 'patient', select: 'nom prenom' } });

    res.status(200).json({
      demandesEnAttente,
      totalDemandes,
      totalResultats,
      demandesTerminees,
      recentDemandes,
      recentResultats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/laboratoire/demandes  → voirDemande()
exports.voirDemande = async (req, res) => {
  try {
    const demandes = await DemandeAnalyse.find({ statut: 'en attente' })
      .populate('patient', 'nom prenom')
      .populate('medecin', 'nom prenom')
      .populate('dme');
    res.status(200).json(demandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/laboratoire/demandes/all  → voirToutesDemandes()
exports.voirToutesDemandes = async (req, res) => {
  try {
    const demandes = await DemandeAnalyse.find()
      .populate('patient', 'nom prenom')
      .populate('medecin', 'nom prenom')
      .populate('dme');
    res.status(200).json(demandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/laboratoire/demandes/:id/status  → updateStatut()
exports.updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const demande = await DemandeAnalyse.findByIdAndUpdate(
      req.params.id,
      { statut, laboratoire: req.user.id },
      { new: true }
    );
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }
    res.status(200).json(demande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/laboratoire/resultats  → ajouterResultat()
exports.ajouterResultat = async (req, res) => {
  try {
    const { demandeId, resultat, interpretation } = req.body;

    const demande = await DemandeAnalyse.findById(demandeId);
    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée' });
    }

    const nouveauResultat = await ResultatAnalyse.create({
      resultat,
      interpretation,
      demande: demandeId,
      laboratoire: req.user.id
    });

    await DemandeAnalyse.findByIdAndUpdate(demandeId, { statut: 'termine' });

    // Ajouter le résultat au DME
    await DME.findByIdAndUpdate(demande.dme, {
      $push: { resultats: nouveauResultat._id }
    });

    res.status(201).json(nouveauResultat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/laboratoire/resultats  → voirResultats()
exports.voirResultats = async (req, res) => {
  try {
    const resultats = await ResultatAnalyse.find({ laboratoire: req.user.id })
      .populate({
        path: 'demande',
        populate: [
          { path: 'patient', select: 'nom prenom' },
          { path: 'medecin', select: 'nom prenom' }
        ]
      });
    res.status(200).json(resultats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};