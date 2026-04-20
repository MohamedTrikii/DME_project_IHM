// Seeder pour remplir la base de données avec des utilisateurs factices
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Utilisateur = require('./models/utilisateur.model');
const Patient = require('./models/patient.model');
const Medecin = require('./models/medecin.model');
const Infirmier = require('./models/infirmier.model');
const Laboratoire = require('./models/laboratoire.model');
const Admin = require('./models/admin.model');
const DME = require('./models/dme.model');
const Consultation = require('./models/consultation.model');
const Ordonnance = require('./models/ordonnance.model');
const DemandeAnalyse = require('./models/demandeAnalyse.model');
const ResultatAnalyse = require('./models/resultat.model');
const Observation = require('./models/observation.model');
const Message = require('./models/message.model');
const LogAccess = require('./models/logAccess.model');

const MONGO_URI = 'mongodb://localhost:27017/dme'; // À adapter si besoin

async function seed() {
  await mongoose.connect(MONGO_URI);
  await Utilisateur.deleteMany({}); await mongoose.connection.db.collection("utilisateurs").dropIndexes();
  await DME.deleteMany({});
  await Consultation.deleteMany({});
  await Ordonnance.deleteMany({});
  await DemandeAnalyse.deleteMany({});
  await ResultatAnalyse.deleteMany({});
  await Observation.deleteMany({});
  await Message.deleteMany({});
  await LogAccess.deleteMany({});

  const hash = async (pwd) => await bcrypt.hash(pwd, 10);


  // Admin
  const admin = await Admin.create({
    nom: 'Ben Ali', prenom: 'Admin', email: 'admin@dme.tn', mot_de_passe: await hash('admin123'), role: 'admin', statut: 'actif'
  });

  // Médecins
  const medecins = await Medecin.create([
    { nom: 'Trabelsi', prenom: 'Sami', email: 'sami.trabelsi@dme.tn', mot_de_passe: await hash('medecin123'), role: 'medecin', specialite: 'Cardiologie', adresse: 'Tunis', statut: 'actif' },
    { nom: 'Ben Youssef', prenom: 'Leila', email: 'leila.benyoussef@dme.tn', mot_de_passe: await hash('medecin123'), role: 'medecin', specialite: 'Dermatologie', adresse: 'Sfax', statut: 'actif' }
  ]);

  // Patients
  const patients = await Patient.create([
    { nom: 'Gharbi', prenom: 'Aymen', email: 'aymen.gharbi@dme.tn', mot_de_passe: await hash('patient123'), role: 'patient', dateNais: new Date(1992, 3, 10), adresse: 'Ariana', telephone: '22123456', statut: 'actif' },
    { nom: 'Masmoudi', prenom: 'Sarra', email: 'sarra.masmoudi@dme.tn', mot_de_passe: await hash('patient123'), role: 'patient', dateNais: new Date(1988, 7, 25), adresse: 'Sousse', telephone: '23456789', statut: 'actif' }
  ]);

  // Infirmiers
  const infirmiers = await Infirmier.create([
    { nom: 'Jaziri', prenom: 'Nidhal', email: 'nidhal.jaziri@dme.tn', mot_de_passe: await hash('infirmier123'), role: 'infirmier', service: 'Urgences', statut: 'actif' }
  ]);

  // Laboratoires
  const labos = await Laboratoire.create([
    { nom: 'LabCentral', prenom: 'Labo', email: 'labcentral@dme.tn', mot_de_passe: await hash('labo123'), role: 'laboratoire', nomLab: 'LabCentral', statut: 'actif' }
  ]);

  // DME pour chaque patient
  const dmes = [];
  for (const patient of patients) {
    dmes.push(await DME.create({ patient: patient._id }));
  }

  // Consultations
  const consultations = [
    await Consultation.create({
      diagnostic: 'Hypertension', traitement: 'Ramipril', notes: 'Contrôle tension régulier', medecin: medecins[0]._id, patient: patients[0]._id, dme: dmes[0]._id
    }),
    await Consultation.create({
      diagnostic: 'Eczéma', traitement: 'Crème hydratante', notes: 'Suivi dermatologique', medecin: medecins[1]._id, patient: patients[1]._id, dme: dmes[1]._id
    })
  ];

  // Ordonnances
  const ordonnances = [
    await Ordonnance.create({
      medicament: 'Paracétamol', posologie: '500mg 3x/j', duree: '5 jours', medecin: medecins[0]._id, patient: patients[0]._id, dme: dmes[0]._id
    }),
    await Ordonnance.create({
      medicament: 'Cétirizine', posologie: '10mg/j', duree: '10 jours', medecin: medecins[1]._id, patient: patients[1]._id, dme: dmes[1]._id
    })
  ];

  // Observations
  const observations = [
    await Observation.create({ contenu: 'Patient stable', infirmier: infirmiers[0]._id }),
    await Observation.create({ contenu: 'Bonne évolution', infirmier: infirmiers[0]._id })
  ];

  // Demandes d’analyse
  const demandes = [
    await DemandeAnalyse.create({ typeAnalyse: 'Glycémie', description: 'Contrôle annuel', medecin: medecins[0]._id, patient: patients[0]._id, laboratoire: labos[0]._id, dme: dmes[0]._id }),
    await DemandeAnalyse.create({ typeAnalyse: 'Bilan lipidique', description: 'Prévention', medecin: medecins[1]._id, patient: patients[1]._id, laboratoire: labos[0]._id, dme: dmes[1]._id })
  ];

  // Résultats d’analyse
  const resultats = [
    await ResultatAnalyse.create({ resultat: 'Glycémie normale', interpretation: 'RAS', demande: demandes[0]._id, laboratoire: labos[0]._id }),
    await ResultatAnalyse.create({ resultat: 'Cholestérol élevé', interpretation: 'Surveillance', demande: demandes[1]._id, laboratoire: labos[0]._id })
  ];

  // Messages
  await Message.create({ from: medecins[0]._id, to: patients[0]._id, text: 'Bonjour, pensez à prendre vos médicaments.' });
  await Message.create({ from: patients[1]._id, to: medecins[1]._id, text: 'Merci docteur pour le suivi.' });

  // Logs d’accès
  await LogAccess.create({ utilisateur: medecins[0]._id, action: 'Connexion' });
  await LogAccess.create({ utilisateur: patients[0]._id, action: 'Consultation DME' });

  console.log('Seed terminé !');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
