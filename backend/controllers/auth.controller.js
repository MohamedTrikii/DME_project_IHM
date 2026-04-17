const Utilisateur   = require('../models/utilisateur.model');
const bcrypt        = require('bcrypt');
const jwt           = require('jsonwebtoken');
const { validateEmail, validatePassword, sanitizeInput, validateRole } = require('../utils/validators');
const { sendError, sendSuccess, handleError } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'dme_secret_key_2026';
const ALLOWED_ROLES = ['admin', 'medecin', 'patient', 'infirmier', 'laboratoire'];

exports.sInscrire = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role, ...extra } = req.body;

    // Validation
    if (!email || !mot_de_passe || !nom || !prenom) {
      return sendError(res, 400, 'Email, mot de passe, nom et prénom requis');
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Email invalide');
    }

    if (!validatePassword(mot_de_passe)) {
      return sendError(res, 400, 'Le mot de passe doit contenir au moins 6 caractères');
    }

    if (!validateRole(role)) {
      return sendError(res, 400, 'Rôle invalide');
    }

    const existant = await Utilisateur.findOne({ email: email.trim().toLowerCase() });
    if (existant) {
      return sendError(res, 409, 'Cet email est déjà utilisé');
    }

    const hashed = await bcrypt.hash(mot_de_passe.trim(), 10);
    const utilisateurId = Date.now();
    const utilisateur = await Utilisateur.create({
      nom: sanitizeInput(nom),
      prenom: sanitizeInput(prenom),
      email: email.trim().toLowerCase(),
      mot_de_passe: hashed,
      role,
      utilisateurId,
      ...extra
    });

    const userSafe = utilisateur.toObject();
    delete userSafe.mot_de_passe;

    return sendSuccess(res, 201, 'Inscription réussie', userSafe);

  } catch (err) {
    handleError(err, res);
  }
};

exports.sAuthentifier = async (req, res) => {
  try {
    let { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
      return sendError(res, 400, 'Email et mot de passe requis');
    }

    email = email.trim().toLowerCase();
    mot_de_passe = mot_de_passe.trim();

    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
      return sendError(res, 401, 'Email ou mot de passe incorrect');
    }

    const valide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);

    if (!valide) {
      return sendError(res, 401, 'Email ou mot de passe incorrect');
    }

    const token = jwt.sign(
      { id: utilisateur._id, email: utilisateur.email, role: utilisateur.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userSafe = utilisateur.toObject();
    delete userSafe.mot_de_passe;

    return sendSuccess(res, 200, 'Authentification réussie', {
      token,
      role: utilisateur.role,
      utilisateur: userSafe
    });

  } catch (err) {
    handleError(err, res);
  }
};

exports.me = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.user.id).select('-mot_de_passe');
    if (!utilisateur) {
      return sendError(res, 404, 'Utilisateur non trouvé');
    }

    return sendSuccess(res, 200, 'Profil récupéré', utilisateur);
  } catch (err) {
    handleError(err, res);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return sendError(res, 400, 'Email valide requis');
    }

    const utilisateur = await Utilisateur.findOne({ email: email.trim().toLowerCase() });

    // Don't reveal if email exists (security best practice)
    if (utilisateur) {
      const resetToken = jwt.sign(
        { id: utilisateur._id, type: 'reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      utilisateur.resetToken = resetToken;
      utilisateur.resetTokenExpiry = Date.now() + 3600000;
      await utilisateur.save();

      // In production, send email with reset link
      if (process.env.NODE_ENV !== 'production') {
        console.log('[DEV] Reset token:', resetToken);
      }
    }

    return sendSuccess(res, 200, 'Si cet email existe, un lien de réinitialisation sera envoyé');
  } catch (err) {
    handleError(err, res);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return sendError(res, 400, 'Token et nouveau mot de passe requis');
    }

    if (!validatePassword(newPassword)) {
      return sendError(res, 400, 'Le mot de passe doit contenir au moins 6 caractères');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return sendError(res, 400, 'Token invalide ou expiré');
    }

    if (decoded.type !== 'reset') {
      return sendError(res, 400, 'Token invalide');
    }

    const utilisateur = await Utilisateur.findById(decoded.id);
    if (!utilisateur) {
      return sendError(res, 404, 'Utilisateur non trouvé');
    }

    if (utilisateur.resetToken !== token || utilisateur.resetTokenExpiry < Date.now()) {
      return sendError(res, 400, 'Token invalide ou expiré');
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    utilisateur.mot_de_passe = hashedPassword;
    utilisateur.resetToken = undefined;
    utilisateur.resetTokenExpiry = undefined;
    await utilisateur.save();

    return sendSuccess(res, 200, 'Mot de passe réinitialisé avec succès');
  } catch (err) {
    handleError(err, res);
  }
};
