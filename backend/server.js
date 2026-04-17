const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('node:path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blogDB';
const MONGO_RETRY_MS = Number(process.env.MONGO_RETRY_MS || 5000);

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

// Disable query buffering so DB issues fail fast instead of timing out later.
mongoose.set('bufferCommands', false);

let isMongoConnected = false;

async function connectMongoWithRetry() {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        isMongoConnected = true;
        console.log('MongoDB Connected');
    } catch (error) {
        isMongoConnected = false;
        console.error(`MongoDB connection failed: ${error.message}`);
        console.log(`Retrying MongoDB connection in ${MONGO_RETRY_MS}ms...`);
        setTimeout(connectMongoWithRetry, MONGO_RETRY_MS);
    }
}

// ✅ Models - MUST be before routes - utilisateur MUST be first
require('./models/utilisateur.model');
require('./models/admin.model');
require('./models/patient.model');
require('./models/medecin.model');
require('./models/infirmier.model');
require('./models/laboratoire.model');
require('./models/dme.model');
require('./models/consultation.model');
require('./models/ordonnance.model');
require('./models/demandeAnalyse.model');
require('./models/resultat.model');
require('./models/observation.model');

// Routes
const authRoutes         = require('./routes/auth.routes');
const adminRoutes        = require('./routes/admin.routes');
const patientRoutes      = require('./routes/patient.routes');
const medecinRoutes      = require('./routes/medecin.routes');
const analyseRoutes      = require('./routes/analyse.route');
const consultationRoutes = require('./routes/consultation.routes');
const dmeRoutes          = require('./routes/Dme.route');
const ordonnanceRoutes   = require('./routes/ordonnance.route');
const resultatRoutes     = require('./routes/resultat.routes');
const infirmierRoutes    = require('./routes/infirmier.routes');
const laboratoireRoutes  = require('./routes/laboratoire.routes');

// Return a clear error while DB is unavailable.
app.use('/api', (req, res, next) => {
    if (!isMongoConnected) {
        return res.status(503).json({
            message: 'Base de donnees indisponible. Verifiez MongoDB puis reessayez.'
        });
    }
    next();
});

app.use('/api/auth',         authRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/patient',      patientRoutes);
app.use('/api/medecin',      medecinRoutes);
app.use('/api/analyse',      analyseRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/dme',          dmeRoutes);
app.use('/api/ordonnance',   ordonnanceRoutes);
app.use('/api/resultat',     resultatRoutes);
app.use('/api/infirmier',    infirmierRoutes);
app.use('/api/laboratoire',  laboratoireRoutes);

// Serve Angular app build in production-like local mode.
const frontendDistPath = path.join(__dirname, 'public');
app.use(express.static(frontendDistPath));

app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'Route API non trouvee' });
    }

    if (req.method === 'GET') {
        return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }

    next();
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

connectMongoWithRetry();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});