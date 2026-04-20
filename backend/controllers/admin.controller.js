// Recherche utilisateur par nom/prénom/email et rôle (medecin, infirmier, laboratoire)
exports.searchUsers = async (req, res) => {
  try {
    const { q = '', role = '' } = req.query;
    const query = {
      statut: 'actif',
      $or: [
        { nom: { $regex: q, $options: 'i' } },
        { prenom: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };
    if (role) query.role = role;
    const users = await Utilisateur.find(query)
      .select('_id nom prenom email role')
      .limit(10)
      .sort({ nom: 1, prenom: 1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Utilisateur   = require('../models/utilisateur.model');
const LogAccess     = require('../models/logAccess.model');
const bcrypt        = require('bcrypt');
const Consultation  = require('../models/consultation.model');
const DemandeAnalyse = require('../models/demandeAnalyse.model');
const ResultatAnalyse = require('../models/resultat.model');

exports.ajouterUtilisateur = async (req, res) => {
  try {
    const { email, mot_de_passe, ...rest } = req.body;

    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const existant = await Utilisateur.findOne({ email });
    if (existant) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const hashed = await bcrypt.hash(mot_de_passe.trim(), 10);
    const utilisateurId = Date.now();
    const user = await Utilisateur.create({
      ...rest,
      email,
      mot_de_passe: hashed,
      utilisateurId
    });

    await LogAccess.create({
      utilisateur: req.user?.id,
      action: `Ajout utilisateur: ${user.email}`
    });

    // 🔒 NEVER send password back
    const userSafe = user.toObject();
    delete userSafe.mot_de_passe;

    res.status(201).json({ message: 'Utilisateur ajouté', user: userSafe });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supprimerUtilisateur = async (req, res) => {
  try {
    const user = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await LogAccess.create({
      utilisateur: req.user?.id,
      action: `Suppression utilisateur: ${user.email}`
    });

    res.status(200).json({ message: 'Utilisateur supprimé' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.consulterLog = async (req, res) => {
  try {
    const logs = await LogAccess.find()
      .populate('utilisateur', 'nom prenom email role')
      .sort({ createdAt: -1 });

    res.status(200).json(logs);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.archiver = async (req, res) => {
  try {
    const user = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      { statut: 'archive' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    await LogAccess.create({
      utilisateur: req.user?.id,
      action: `Archivage utilisateur: ${user.email}`
    });

    res.status(200).json({ message: 'Utilisateur archivé', user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listerUtilisateurs = async (req, res) => {
  try {
    const users = await Utilisateur.find()
      .select('-mot_de_passe')
      .sort({ createdAt: -1 });

    res.status(200).json(users);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUtilisateurById = async (req, res) => {
  try {
    const user = await Utilisateur.findById(req.params.id).select('-mot_de_passe');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.modifierUtilisateur = async (req, res) => {
  try {
    const allowedFields = ['nom', 'prenom', 'email', 'role'];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Aucune donnee a mettre a jour' });
    }

    if (updates.email) {
      const conflict = await Utilisateur.findOne({
        email: updates.email,
        _id: { $ne: req.params.id }
      });

      if (conflict) {
        return res.status(400).json({ message: 'Email deja utilise' });
      }
    }

    const user = await Utilisateur.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-mot_de_passe');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }

    await LogAccess.create({
      utilisateur: req.user?.id,
      action: `Modification utilisateur: ${user.email}`
    });

    res.status(200).json({ message: 'Utilisateur modifie', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalPatients,
      totalMedecins,
      totalInfirmiers,
      totalLaboratoires,
      totalConsultations,
      totalAnalyses,
      totalRapports,
      logsToday
    ] = await Promise.all([
      Utilisateur.countDocuments(),
      Utilisateur.countDocuments({ role: 'patient' }),
      Utilisateur.countDocuments({ role: 'medecin' }),
      Utilisateur.countDocuments({ role: 'infirmier' }),
      Utilisateur.countDocuments({ role: 'laboratoire' }),
      Consultation.countDocuments(),
      DemandeAnalyse.countDocuments(),
      ResultatAnalyse.countDocuments(),
      LogAccess.countDocuments({ createdAt: { $gte: startOfDay } })
    ]);

    res.status(200).json({
      totalUsers,
      activeUsers: totalUsers,
      totalPatients,
      totalMedecins,
      totalInfirmiers,
      totalLaboratoires,
      totalConsultations,
      totalAnalyses,
      totalRapports,
      logsToday,
      securityAlerts: 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const users = await Utilisateur.find().select('-mot_de_passe').lean();

    const header = ['id', 'nom', 'prenom', 'email', 'role', 'createdAt'];
    const escapeCell = (value) => {
      const raw = value == null ? '' : String(value);
      return `"${raw.replaceAll('"', '""')}"`;
    };

    const rows = users.map((u) => [
      u._id,
      u.nom,
      u.prenom,
      u.email,
      u.role,
      u.createdAt
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};