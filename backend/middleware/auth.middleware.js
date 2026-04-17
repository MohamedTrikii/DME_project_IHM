
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dme_secret_key_2026';

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token manquant' });
    }

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ SAVE USER INFO
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};