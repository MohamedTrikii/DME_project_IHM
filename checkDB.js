const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://127.0.0.1:27017/blogDB';

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Utilisateur = mongoose.model('Utilisateur', new mongoose.Schema({
            role: String,
            statut: String,
            email: String,
            nom: String
        }), 'utilisateurs');

        const patients = await Utilisateur.find({role: 'patient', statut: 'actif'});
        console.log('PATIENTS_COUNT:', patients.length);
        console.log('PATIENTS:', JSON.stringify(patients));

        const medecins = await Utilisateur.find({role: 'medecin'});
        console.log('MEDECINS:', JSON.stringify(medecins));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
