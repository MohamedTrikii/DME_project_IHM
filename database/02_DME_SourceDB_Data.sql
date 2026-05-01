-- ============================================================
-- Fichier : 02_DME_SourceDB_Data.sql
-- Description : Insertion des données réalistes dans DME_SourceDB
-- Données couvrant la période 2022-2025
-- Noms tunisiens authentiques, données médicales cohérentes
-- ============================================================

USE DME_SourceDB;
GO

-- ============================================================
-- 1. GOUVERNORATS (8)
-- ============================================================
SET IDENTITY_INSERT Gouvernorats ON;
INSERT INTO Gouvernorats (GouvernoratID, Nom) VALUES
(1, N'Tunis'),
(2, N'Sfax'),
(3, N'Sousse'),
(4, N'Monastir'),
(5, N'Ariana'),
(6, N'Bizerte'),
(7, N'Nabeul'),
(8, N'Kairouan');
SET IDENTITY_INSERT Gouvernorats OFF;
GO

-- ============================================================
-- 2. VILLES (15)
-- ============================================================
SET IDENTITY_INSERT Villes ON;
INSERT INTO Villes (VilleID, Nom, GouvernoratID) VALUES
(1,  N'Tunis Centre',   1),
(2,  N'La Marsa',       1),
(3,  N'Sfax Ville',     2),
(4,  N'Sakiet Ezzit',   2),
(5,  N'Sousse Médina',  3),
(6,  N'Hammam Sousse',  3),
(7,  N'Monastir Ville', 4),
(8,  N'Ariana Ville',   5),
(9,  N'Raoued',         5),
(10, N'Bizerte Ville',  6),
(11, N'Menzel Bourguiba',6),
(12, N'Nabeul Ville',   7),
(13, N'Hammamet',       7),
(14, N'Kairouan Ville', 8),
(15, N'Sbikha',         8);
SET IDENTITY_INSERT Villes OFF;
GO

-- ============================================================
-- 3. SPÉCIALITÉS (8)
-- ============================================================
SET IDENTITY_INSERT Specialites ON;
INSERT INTO Specialites (SpecialiteID, Nom, Description) VALUES
(1, N'Cardiologie',        N'Spécialité médicale qui étudie le cœur et les maladies cardiovasculaires'),
(2, N'Dermatologie',       N'Spécialité médicale consacrée aux maladies de la peau, des cheveux et des ongles'),
(3, N'Pédiatrie',          N'Spécialité médicale qui s''occupe des enfants de la naissance à l''adolescence'),
(4, N'Neurologie',         N'Spécialité médicale traitant les maladies du système nerveux central et périphérique'),
(5, N'Orthopédie',         N'Spécialité chirurgicale traitant les maladies de l''appareil locomoteur'),
(6, N'Gynécologie',        N'Spécialité médicale et chirurgicale dédiée à la santé de la femme'),
(7, N'Endocrinologie',     N'Spécialité médicale traitant les maladies du système hormonal et métabolique'),
(8, N'Médecine Générale',  N'Médecine de premier recours prenant en charge toutes les pathologies courantes');
SET IDENTITY_INSERT Specialites OFF;
GO

-- ============================================================
-- 4. TYPES D'ANALYSE (12)
-- ============================================================
SET IDENTITY_INSERT TypesAnalyse ON;
INSERT INTO TypesAnalyse (TypeAnalyseID, Nom, Unite, ValeurNormaleMin, ValeurNormaleMax) VALUES
(1,  N'Glycémie à jeun',       N'g/L',    0.700, 1.100),
(2,  N'NFS (Numération)',       N'10^9/L', 4.000, 10.000),
(3,  N'Bilan lipidique (LDL)', N'g/L',    0.000, 1.600),
(4,  N'TSH',                   N'mUI/L',  0.400, 4.000),
(5,  N'Créatinine',            N'mg/L',   6.000, 12.000),
(6,  N'ASAT',                  N'UI/L',   5.000, 40.000),
(7,  N'ALAT',                  N'UI/L',   5.000, 41.000),
(8,  N'INR',                   N'ratio',  0.800, 1.200),
(9,  N'CRP',                   N'mg/L',   0.000, 5.000),
(10, N'HbA1c',                 N'%',      4.000, 5.700),
(11, N'Ionogramme (Sodium)',    N'mmol/L', 136.000, 145.000),
(12, N'PSA total',             N'ng/mL',  0.000, 4.000);
SET IDENTITY_INSERT TypesAnalyse OFF;
GO

-- ============================================================
-- 5. MÉDICAMENTS (20)
-- ============================================================
SET IDENTITY_INSERT Medicaments ON;
INSERT INTO Medicaments (MedicamentID, NomCommercial, NomGenerique, Classe, Forme, Dosage) VALUES
(1,  N'Paracétamol Mylan',  N'Paracétamol',    N'Antalgique/Antipyrétique', N'Comprimé',  N'500 mg'),
(2,  N'Amoxicilline Sandoz',N'Amoxicilline',   N'Antibiotique (Pénicilline)',N'Gélule',   N'500 mg'),
(3,  N'Glucophage',         N'Metformine',     N'Antidiabétique oral',      N'Comprimé',  N'850 mg'),
(4,  N'Amlor',              N'Amlodipine',     N'Antihypertenseur (ICa)',   N'Comprimé',  N'5 mg'),
(5,  N'Tahor',              N'Atorvastatine',  N'Hypolipémiant (Statine)',  N'Comprimé',  N'20 mg'),
(6,  N'Mopral',             N'Oméprazole',     N'Inhibiteur pompe à protons',N'Gélule',   N'20 mg'),
(7,  N'Doliprane',          N'Paracétamol',    N'Antalgique/Antipyrétique', N'Comprimé',  N'1000 mg'),
(8,  N'Augmentin',          N'Amoxicilline/Ac. clavulanique',N'Antibiotique',N'Comprimé', N'1g/125 mg'),
(9,  N'Lasilix',            N'Furosémide',     N'Diurétique de l''anse',   N'Comprimé',  N'40 mg'),
(10, N'Triatec',            N'Ramipril',       N'Antihypertenseur (IEC)',   N'Gélule',    N'5 mg'),
(11, N'Zyrtec',             N'Cétirizine',     N'Antihistaminique',         N'Comprimé',  N'10 mg'),
(12, N'Advil',              N'Ibuprofène',     N'AINS',                     N'Comprimé',  N'400 mg'),
(13, N'Eupantol',           N'Pantoprazole',   N'Inhibiteur pompe à protons',N'Comprimé', N'40 mg'),
(14, N'Cardensiel',         N'Bisoprolol',     N'Bêtabloquant',             N'Comprimé',  N'5 mg'),
(15, N'Levothyrox',         N'Lévothyroxine',  N'Hormones thyroïdiennes',   N'Comprimé',  N'100 µg'),
(16, N'Lantus SoloStar',    N'Insuline glargine',N'Insuline',               N'Solution inj.',N'100 UI/mL'),
(17, N'Aspégic',            N'Acide acétylsalicylique',N'Antiagrégant plaquettaire',N'Sachet',N'100 mg'),
(18, N'Codéine Pharmaki',   N'Codéine',        N'Antalgique opioïde faible',N'Comprimé',  N'30 mg'),
(19, N'Topalgic',           N'Tramadol',       N'Antalgique opioïde',       N'Gélule',    N'50 mg'),
(20, N'Solupred',           N'Prednisolone',   N'Corticoïde',               N'Comprimé',  N'20 mg');
SET IDENTITY_INSERT Medicaments OFF;
GO

-- ============================================================
-- 6. DIAGNOSTICS CIM-10 (15)
-- ============================================================
SET IDENTITY_INSERT Diagnostics ON;
INSERT INTO Diagnostics (DiagnosticID, CodeCIM10, Libelle, Categorie) VALUES
(1,  N'I10',  N'Hypertension artérielle essentielle',         N'Maladies cardiovasculaires'),
(2,  N'E11',  N'Diabète de type 2',                           N'Maladies métaboliques'),
(3,  N'I50',  N'Insuffisance cardiaque',                      N'Maladies cardiovasculaires'),
(4,  N'J45',  N'Asthme',                                      N'Maladies respiratoires'),
(5,  N'S72',  N'Fracture du fémur',                           N'Traumatologie'),
(6,  N'L20',  N'Dermatite atopique (Eczéma)',                 N'Maladies dermatologiques'),
(7,  N'G43',  N'Migraine',                                    N'Maladies neurologiques'),
(8,  N'E03',  N'Hypothyroïdie',                               N'Maladies endocriniennes'),
(9,  N'D50',  N'Anémie par carence en fer',                   N'Maladies hématologiques'),
(10, N'M54',  N'Lombalgie',                                   N'Maladies ostéoarticulaires'),
(11, N'J18',  N'Pneumonie',                                   N'Maladies respiratoires'),
(12, N'H66',  N'Otite moyenne suppurée',                      N'Maladies ORL'),
(13, N'K35',  N'Appendicite aiguë',                           N'Maladies digestives'),
(14, N'J30',  N'Rhinite allergique',                          N'Maladies respiratoires'),
(15, N'K29',  N'Gastrite',                                    N'Maladies digestives');
SET IDENTITY_INSERT Diagnostics OFF;
GO

-- ============================================================
-- 7. HÔPITAUX (5)
-- ============================================================
SET IDENTITY_INSERT Hopitaux ON;
INSERT INTO Hopitaux (HopitalID, Nom, Type, VilleID, Adresse, Telephone) VALUES
(1, N'Hôpital Charles Nicolle',   N'Public',   1,  N'Boulevard du 9 Avril, Tunis',          N'+216 71 578 000'),
(2, N'Clinique Les Oliviers',     N'Privé',    3,  N'Avenue Hédi Chaker, Sfax',              N'+216 74 224 433'),
(3, N'CHU Sahloul',               N'Public',   5,  N'Route Ceinture Sahloul, Sousse',        N'+216 73 369 000'),
(4, N'Polyclinique Monastir',     N'Privé',    7,  N'Rue de l''Indépendance, Monastir',      N'+216 73 463 200'),
(5, N'Centre Médical Ariana',     N'Clinique', 8,  N'Avenue de la République, Ariana',       N'+216 71 701 055');
SET IDENTITY_INSERT Hopitaux OFF;
GO

-- ============================================================
-- 8. UTILISATEURS
-- ============================================================

-- Admin (1)
SET IDENTITY_INSERT Utilisateurs ON;
INSERT INTO Utilisateurs (UtilisateurID, Nom, Prenom, Email, MotDePasse, Role, Statut, DateCreation, DerniereConnexion) VALUES
(1, N'Triki', N'Mohamed', N'admin@dme.tn', N'$2b$10$hashed_admin_pwd', N'admin', N'actif', '2022-01-15', '2025-04-20');
SET IDENTITY_INSERT Utilisateurs OFF;
GO

INSERT INTO Admins (AdminID, NiveauAcces) VALUES (1, 3);
GO

-- Médecins (6)
SET IDENTITY_INSERT Utilisateurs ON;
INSERT INTO Utilisateurs (UtilisateurID, Nom, Prenom, Email, MotDePasse, Role, Statut, DateCreation, DerniereConnexion) VALUES
(2,  N'Ben Ali',   N'Karim',    N'karim.benali@dme.tn',    N'$2b$10$hashed_pwd', N'medecin', N'actif', '2022-01-20', '2025-04-19'),
(3,  N'Maatoug',   N'Sonia',    N'sonia.maatoug@dme.tn',   N'$2b$10$hashed_pwd', N'medecin', N'actif', '2022-02-01', '2025-04-18'),
(4,  N'Gharbi',    N'Nizar',    N'nizar.gharbi@dme.tn',    N'$2b$10$hashed_pwd', N'medecin', N'actif', '2022-02-15', '2025-04-17'),
(5,  N'Belhaj',    N'Fatma',    N'fatma.belhaj@dme.tn',    N'$2b$10$hashed_pwd', N'medecin', N'actif', '2022-03-01', '2025-04-16'),
(6,  N'Hamdi',     N'Walid',    N'walid.hamdi@dme.tn',     N'$2b$10$hashed_pwd', N'medecin', N'actif', '2022-03-10', '2025-04-15'),
(7,  N'Jlidi',     N'Amira',    N'amira.jlidi@dme.tn',     N'$2b$10$hashed_pwd', N'medecin', N'actif', '2022-04-01', '2025-04-14');
SET IDENTITY_INSERT Utilisateurs OFF;
GO

INSERT INTO Medecins (MedecinID, SpecialiteID, HopitalID, NumeroOrdre, Adresse, Telephone, AnneesExperience) VALUES
(2, 1, 1, N'OM-2156', N'Rue Aly Bach Hamba, Tunis',        N'+216 22 345 678', 15),
(3, 7, 3, N'OM-3284', N'Avenue Bourguiba, Sousse',          N'+216 98 765 432', 12),
(4, 4, 1, N'OM-4512', N'Rue de Marseille, Tunis',           N'+216 25 987 654', 8),
(5, 6, 4, N'OM-5123', N'Boulevard de l''Environnement, Monastir', N'+216 52 147 369', 10),
(6, 5, 2, N'OM-6789', N'Avenue Hédi Chaker, Sfax',          N'+216 74 654 321', 20),
(7, 8, 5, N'OM-7456', N'Avenue de la République, Ariana',   N'+216 71 789 123', 5);
GO

-- Infirmiers (3)
SET IDENTITY_INSERT Utilisateurs ON;
INSERT INTO Utilisateurs (UtilisateurID, Nom, Prenom, Email, MotDePasse, Role, Statut, DateCreation, DerniereConnexion) VALUES
(8,  N'Saidi',     N'Leila',    N'leila.saidi@dme.tn',     N'$2b$10$hashed_pwd', N'infirmier', N'actif', '2022-05-01', '2025-04-20'),
(9,  N'Nasri',     N'Hichem',   N'hichem.nasri@dme.tn',    N'$2b$10$hashed_pwd', N'infirmier', N'actif', '2022-05-15', '2025-04-19'),
(10, N'Chebbi',    N'Rima',     N'rima.chebbi@dme.tn',     N'$2b$10$hashed_pwd', N'infirmier', N'actif', '2022-06-01', '2025-04-18');
SET IDENTITY_INSERT Utilisateurs OFF;
GO

INSERT INTO Infirmiers (InfirmierID, Service, HopitalID, Telephone) VALUES
(8,  N'Cardiologie',   1, N'+216 22 111 222'),
(9,  N'Urgences',      3, N'+216 98 333 444'),
(10, N'Pédiatrie',     1, N'+216 25 555 666');
GO

-- Laboratoires (2)
SET IDENTITY_INSERT Utilisateurs ON;
INSERT INTO Utilisateurs (UtilisateurID, Nom, Prenom, Email, MotDePasse, Role, Statut, DateCreation, DerniereConnexion) VALUES
(11, N'BioLab',    N'Tunis',    N'contact@biolab.tn',      N'$2b$10$hashed_pwd', N'laboratoire', N'actif', '2022-01-10', '2025-04-20'),
(12, N'LabCentral',N'Sfax',     N'info@labcentral-sfax.tn',N'$2b$10$hashed_pwd', N'laboratoire', N'actif', '2022-01-12', '2025-04-19');
SET IDENTITY_INSERT Utilisateurs OFF;
GO

INSERT INTO Laboratoires (LaboratoireID, NomLaboratoire, VilleID, Adresse, Telephone, Agree) VALUES
(11, N'BioLab Tunis',    1, N'Rue Ibn Sina, Tunis',       N'+216 71 222 333', 1),
(12, N'LabCentral Sfax', 3, N'Avenue Farhat Hached, Sfax',N'+216 74 444 555', 1);
GO

-- Patients (30)
SET IDENTITY_INSERT Utilisateurs ON;
INSERT INTO Utilisateurs (UtilisateurID, Nom, Prenom, Email, MotDePasse, Role, Statut, DateCreation, DerniereConnexion) VALUES
(13, N'Bouzid',    N'Ahmed',    N'ahmed.bouzid@email.tn',   N'$2b$10$p', N'patient', N'actif', '2022-03-01', '2025-01-10'),
(14, N'Manai',     N'Fatma',    N'fatma.manai@email.tn',    N'$2b$10$p', N'patient', N'actif', '2022-03-05', '2025-02-14'),
(15, N'Khalfallah',N'Youssef',  N'youssef.khalfallah@email.tn',N'$2b$10$p',N'patient',N'actif','2022-03-10','2024-11-20'),
(16, N'Ben Youssef',N'Mariem',  N'mariem.benyoussef@email.tn',N'$2b$10$p',N'patient',N'actif','2022-04-01','2025-03-05'),
(17, N'Trabelsi',  N'Mondher',  N'mondher.trabelsi@email.tn',N'$2b$10$p',N'patient',N'actif','2022-04-10','2024-12-15'),
(18, N'Mabrouk',   N'Sarra',    N'sarra.mabrouk@email.tn',  N'$2b$10$p', N'patient', N'actif', '2022-05-01', '2025-04-01'),
(19, N'Guesmi',    N'Khaled',   N'khaled.guesmi@email.tn',  N'$2b$10$p', N'patient', N'actif', '2022-05-15', '2025-01-25'),
(20, N'Cherif',    N'Nadia',    N'nadia.cherif@email.tn',   N'$2b$10$p', N'patient', N'actif', '2022-06-01', '2024-10-30'),
(21, N'Haddad',    N'Bilel',    N'bilel.haddad@email.tn',   N'$2b$10$p', N'patient', N'actif', '2022-06-15', '2025-02-20'),
(22, N'Ayari',     N'Olfa',     N'olfa.ayari@email.tn',     N'$2b$10$p', N'patient', N'actif', '2022-07-01', '2025-03-18'),
(23, N'Bouaziz',   N'Rim',      N'rim.bouaziz@email.tn',    N'$2b$10$p', N'patient', N'actif', '2022-07-10', '2024-09-05'),
(24, N'Jemli',     N'Hatem',    N'hatem.jemli@email.tn',    N'$2b$10$p', N'patient', N'actif', '2022-08-01', '2025-04-10'),
(25, N'Ferchichi', N'Amina',    N'amina.ferchichi@email.tn',N'$2b$10$p', N'patient', N'actif', '2022-08-15', '2025-03-22'),
(26, N'Karray',    N'Sofien',   N'sofien.karray@email.tn',  N'$2b$10$p', N'patient', N'actif', '2022-09-01', '2024-12-01'),
(27, N'Zouari',    N'Ines',     N'ines.zouari@email.tn',    N'$2b$10$p', N'patient', N'actif', '2022-09-10', '2025-01-15'),
(28, N'Mrabet',    N'Tarek',    N'tarek.mrabet@email.tn',   N'$2b$10$p', N'patient', N'actif', '2022-10-01', '2025-02-28'),
(29, N'Sebai',     N'Wafa',     N'wafa.sebai@email.tn',     N'$2b$10$p', N'patient', N'actif', '2022-10-15', '2024-11-11'),
(30, N'Hamrouni',  N'Zied',     N'zied.hamrouni@email.tn',  N'$2b$10$p', N'patient', N'actif', '2022-11-01', '2025-04-05'),
(31, N'Ben Salah', N'Dalel',    N'dalel.bensalah@email.tn', N'$2b$10$p', N'patient', N'actif', '2022-11-15', '2025-03-30'),
(32, N'Romdhane',  N'Adel',     N'adel.romdhane@email.tn',  N'$2b$10$p', N'patient', N'actif', '2022-12-01', '2024-08-20'),
(33, N'Mejri',     N'Amel',     N'amel.mejri@email.tn',     N'$2b$10$p', N'patient', N'actif', '2023-01-05', '2025-02-10'),
(34, N'Riahi',     N'Bassem',   N'bassem.riahi@email.tn',   N'$2b$10$p', N'patient', N'actif', '2023-01-20', '2025-01-05'),
(35, N'Jelassi',   N'Hana',     N'hana.jelassi@email.tn',   N'$2b$10$p', N'patient', N'actif', '2023-02-10', '2024-12-25'),
(36, N'Chaabane',  N'Raouf',    N'raouf.chaabane@email.tn', N'$2b$10$p', N'patient', N'actif', '2023-02-25', '2025-03-14'),
(37, N'Nasr',      N'Sirine',   N'sirine.nasr@email.tn',    N'$2b$10$p', N'patient', N'actif', '2023-03-15', '2025-04-12'),
(38, N'Boukthir',  N'Mourad',   N'mourad.boukthir@email.tn',N'$2b$10$p', N'patient', N'actif', '2023-04-01', '2024-10-18'),
(39, N'Hachani',   N'Lobna',    N'lobna.hachani@email.tn',  N'$2b$10$p', N'patient', N'actif', '2023-04-20', '2025-02-05'),
(40, N'Dridi',     N'Mehdi',    N'mehdi.dridi@email.tn',    N'$2b$10$p', N'patient', N'actif', '2023-05-10', '2025-03-25'),
(41, N'Agrebi',    N'Salma',    N'salma.agrebi@email.tn',   N'$2b$10$p', N'patient', N'actif', '2023-06-01', '2024-11-30'),
(42, N'Oueslati',  N'Kamel',    N'kamel.oueslati@email.tn', N'$2b$10$p', N'patient', N'actif', '2023-07-01', '2025-04-08');
SET IDENTITY_INSERT Utilisateurs OFF;
GO

INSERT INTO Patients (PatientID, DateNaissance, Sexe, Adresse, VilleID, Telephone, GroupeSanguin, Allergies, Assurance, NumeroAssurance) VALUES
(13, '1975-05-14', N'M', N'12 Rue des Roses, Tunis',           1,  N'+216 22 100 001', N'A+',  N'Aucune',           N'CNAM',   N'CNAM-12345'),
(14, '1988-11-22', N'F', N'45 Avenue Bourguiba, Sfax',         3,  N'+216 98 200 002', N'B+',  N'Pénicilline',      N'Privée', N'PRIV-67890'),
(15, '1965-03-08', N'M', N'7 Rue Ibn Khaldoun, Sousse',        5,  N'+216 25 300 003', N'O+',  N'Aucune',           N'CNAM',   N'CNAM-23456'),
(16, '1992-07-30', N'F', N'23 Rue de la Liberté, Monastir',    7,  N'+216 52 400 004', N'AB+', N'Aspirine',         N'Privée', N'PRIV-34567'),
(17, '1958-12-05', N'M', N'56 Avenue Habib Bourguiba, Ariana', 8,  N'+216 71 500 005', N'A-',  N'Aucune',           N'CNAM',   N'CNAM-45678'),
(18, '1995-09-17', N'F', N'89 Rue Taher Sfar, Bizerte',        10, N'+216 22 600 006', N'B-',  N'Sulfamides',       N'Sans',   NULL),
(19, '1970-04-25', N'M', N'34 Rue des Fleurs, Nabeul',         12, N'+216 98 700 007', N'O-',  N'Aucune',           N'CNAM',   N'CNAM-56789'),
(20, '1983-08-12', N'F', N'67 Avenue de la Paix, Kairouan',    14, N'+216 25 800 008', N'A+',  N'Codéine',          N'Privée', N'PRIV-78901'),
(21, '1990-01-28', N'M', N'11 Rue de la Mer, La Marsa',        2,  N'+216 52 900 009', N'B+',  N'Aucune',           N'CNAM',   N'CNAM-67890'),
(22, '1977-06-03', N'F', N'45 Rue Farhat Hached, Sfax',        3,  N'+216 71 111 010', N'O+',  N'Latex',            N'Privée', N'PRIV-89012'),
(23, '2001-10-15', N'F', N'78 Avenue de la République, Ariana',8,  N'+216 22 222 011', N'A+',  N'Aucune',           N'Sans',   NULL),
(24, '1955-02-20', N'M', N'90 Boulevard 7 Novembre, Tunis',    1,  N'+216 98 333 012', N'AB-', N'Iode',             N'CNAM',   N'CNAM-78901'),
(25, '1987-12-09', N'F', N'12 Rue des Jasmins, Sousse',        5,  N'+216 25 444 013', N'B+',  N'Aucune',           N'Privée', N'PRIV-90123'),
(26, '1963-07-18', N'M', N'56 Rue de Carthage, Hammamet',      13, N'+216 52 555 014', N'O+',  N'Pénicilline',      N'CNAM',   N'CNAM-89012'),
(27, '1998-04-07', N'F', N'23 Rue Ibn Batouta, Monastir',      7,  N'+216 71 666 015', N'A+',  N'Aucune',           N'Sans',   NULL),
(28, '1972-11-30', N'M', N'67 Avenue Menzel Bourguiba',        11, N'+216 22 777 016', N'B+',  N'AINS',             N'CNAM',   N'CNAM-90123'),
(29, '1985-08-22', N'F', N'34 Rue de la Victoire, Nabeul',     12, N'+216 98 888 017', N'O+',  N'Aucune',           N'Privée', N'PRIV-01234'),
(30, '1960-01-14', N'M', N'11 Rue Cheikh Bechir Sfar, Tunis',  1,  N'+216 25 999 018', N'A+',  N'Aucune',           N'CNAM',   N'CNAM-01234'),
(31, '1993-05-26', N'F', N'89 Route Ain Draham, Bizerte',      10, N'+216 52 000 019', N'B-',  N'Aucune',           N'Sans',   NULL),
(32, '1978-09-11', N'M', N'45 Avenue Carthage, Sfax',          4,  N'+216 71 100 020', N'O+',  N'Corticoïdes',      N'CNAM',   N'CNAM-12340'),
(33, '1966-03-04', N'F', N'12 Rue des Oliviers, Sousse',       6,  N'+216 22 200 021', N'A-',  N'Aucune',           N'Privée', N'PRIV-23450'),
(34, '2003-07-19', N'M', N'78 Route de Sfax, Kairouan',        14, N'+216 98 300 022', N'B+',  N'Aucune',           N'Sans',   NULL),
(35, '1981-12-28', N'F', N'23 Rue Majida Boulila, Ariana',     9,  N'+216 25 400 023', N'O+',  N'Aspirine',         N'CNAM',   N'CNAM-34560'),
(36, '1950-06-15', N'M', N'56 Rue de la Paix, Tunis',          1,  N'+216 52 500 024', N'A+',  N'Aucune',           N'Privée', N'PRIV-45670'),
(37, '1996-02-08', N'F', N'34 Avenue Habib Thameur, Sfax',     3,  N'+216 71 600 025', N'AB+', N'Aucune',           N'Sans',   NULL),
(38, '1969-10-03', N'M', N'67 Rue des Martyrs, Sousse',        5,  N'+216 22 700 026', N'O+',  N'Morphine',         N'CNAM',   N'CNAM-56780'),
(39, '1991-04-17', N'F', N'11 Rue Alain Savary, Tunis',        1,  N'+216 98 800 027', N'B+',  N'Aucune',           N'Privée', N'PRIV-67800'),
(40, '1974-08-29', N'M', N'45 Avenue 18 Janvier, Sbikha',      15, N'+216 25 900 028', N'A+',  N'Aucune',           N'CNAM',   N'CNAM-67890'),
(41, '1989-01-05', N'F', N'78 Rue 20 Mars, Hammam Sousse',     6,  N'+216 52 010 029', N'O-',  N'Ibuprofen',        N'Privée', N'PRIV-78900'),
(42, '1962-07-22', N'M', N'90 Route de Bizerte, Raoued',       9,  N'+216 71 020 030', N'A+',  N'Aucune',           N'CNAM',   N'CNAM-78900');
GO

-- ============================================================
-- 9. DME (30 — un par patient)
-- ============================================================
SET IDENTITY_INSERT DME ON;
INSERT INTO DME (DMEID, PatientID, DateCreation, Statut) VALUES
(1,  13, '2022-03-05',  N'actif'),
(2,  14, '2022-03-08',  N'actif'),
(3,  15, '2022-03-12',  N'actif'),
(4,  16, '2022-04-03',  N'actif'),
(5,  17, '2022-04-12',  N'actif'),
(6,  18, '2022-05-05',  N'actif'),
(7,  19, '2022-05-18',  N'actif'),
(8,  20, '2022-06-05',  N'actif'),
(9,  21, '2022-06-18',  N'actif'),
(10, 22, '2022-07-05',  N'actif'),
(11, 23, '2022-07-12',  N'actif'),
(12, 24, '2022-08-05',  N'actif'),
(13, 25, '2022-08-18',  N'actif'),
(14, 26, '2022-09-05',  N'actif'),
(15, 27, '2022-09-12',  N'actif'),
(16, 28, '2022-10-05',  N'actif'),
(17, 29, '2022-10-18',  N'actif'),
(18, 30, '2022-11-05',  N'actif'),
(19, 31, '2022-11-18',  N'actif'),
(20, 32, '2022-12-05',  N'actif'),
(21, 33, '2023-01-10',  N'actif'),
(22, 34, '2023-01-25',  N'actif'),
(23, 35, '2023-02-15',  N'actif'),
(24, 36, '2023-03-02',  N'actif'),
(25, 37, '2023-03-20',  N'actif'),
(26, 38, '2023-04-05',  N'actif'),
(27, 39, '2023-04-25',  N'actif'),
(28, 40, '2023-05-15',  N'actif'),
(29, 41, '2023-06-10',  N'actif'),
(30, 42, '2023-07-08',  N'actif');
SET IDENTITY_INSERT DME OFF;
GO

-- ============================================================
-- 10. CONSULTATIONS (75)
-- ============================================================
SET IDENTITY_INSERT Consultations ON;
INSERT INTO Consultations (ConsultationID, DMEID, PatientID, MedecinID, DiagnosticID, DateConsultation, Motif, Notes, Traitement, TypeConsultation, DureeMinutes, HopitalID) VALUES
-- 2022
(1,  1,  13, 2, 1,  '2022-03-10 09:00', N'Hypertension',        N'TA 160/100, suivi recommandé',        N'Amlodipine 5mg',     N'Standard', 30, 1),
(2,  2,  14, 3, 2,  '2022-03-15 10:30', N'Diabète suivi',        N'HbA1c 8.2%, ajustement traitement',  N'Metformine 850mg',   N'Suivi',    25, 3),
(3,  3,  15, 2, 1,  '2022-04-01 14:00', N'Céphalées',            N'HTA non contrôlée',                   N'Ramipril 5mg',       N'Urgence',  45, 1),
(4,  4,  16, 5, 6,  '2022-04-20 11:00', N'Douleurs pelviennes',  N'Examen normal',                       N'Ibuprofène 400mg',   N'Standard', 35, 4),
(5,  5,  17, 2, 3,  '2022-05-05 09:30', N'Dyspnée',              N'Insuffisance cardiaque décompensée', N'Furosémide 40mg',    N'Urgence',  60, 1),
(6,  6,  18, 7, 14, '2022-05-20 15:00', N'Rhinite allergique',   N'Allergies saisonnières',              N'Cétirizine 10mg',    N'Standard', 20, 5),
(7,  7,  19, 7, 10, '2022-06-08 10:00', N'Lombalgie',            N'Lombalgie chronique',                 N'Ibuprofène + repos', N'Suivi',    30, 5),
(8,  8,  20, 3, 2,  '2022-06-22 14:00', N'Contrôle diabète',     N'Glycémie 2.1 g/L',                   N'Insuline Lantus',    N'Suivi',    20, 3),
(9,  9,  21, 4, 7,  '2022-07-05 09:00', N'Céphalées sévères',    N'Migraine avec aura',                  N'Tramadol 50mg',      N'Standard', 40, 1),
(10, 10, 22, 7, 6,  '2022-07-18 11:30', N'Éruption cutanée',     N'Eczéma des membres',                  N'Prednisolone 20mg',  N'Standard', 25, 5),
(11, 11, 23, 7, 14, '2022-08-02 10:00', N'Rhinite',              N'Rhinite persistante',                 N'Cétirizine 10mg',    N'Standard', 20, 5),
(12, 12, 24, 2, 1,  '2022-08-15 09:00', N'HTA',                  N'TA 170/105, risque élevé',            N'Bisoprolol 5mg',     N'Urgence',  50, 1),
(13, 13, 25, 3, 2,  '2022-09-01 14:30', N'Diabète type 2',       N'Bilan annuel',                        N'Metformine 850mg',   N'Suivi',    30, 3),
(14, 14, 26, 7, 10, '2022-09-20 11:00', N'Lombalgie aiguë',      N'Après effort physique',               N'Tramadol + repos',   N'Standard', 35, 5),
(15, 15, 27, 5, 4,  '2022-10-10 10:00', N'Asthme',               N'Crise asthmatique légère',            N'Bronchodilatateur',  N'Urgence',  40, 4),
(16, 16, 28, 6, 5,  '2022-10-25 14:00', N'Fracture suspectée',   N'Radio nécessaire',                    N'Antalgiques',        N'Urgence',  55, 2),
(17, 17, 29, 7, 15, '2022-11-08 09:30', N'Gastrite',             N'Douleurs épigastriques',              N'Oméprazole 20mg',    N'Standard', 25, 5),
(18, 18, 30, 4, 8,  '2022-11-22 10:00', N'Hypothyroïdie',        N'TSH élevée',                         N'Levothyrox 100µg',   N'Standard', 30, 1),
(19, 19, 31, 7, 14, '2022-12-05 15:00', N'Rhinite chronique',    N'Allergie pollinique',                 N'Cétirizine 10mg',    N'Suivi',    20, 5),
(20, 20, 32, 6, 5,  '2022-12-18 11:00', N'Fracture fémur',       N'Chute, fracture confirmée',           N'Chirurgie + morphine',N'Urgence', 90, 2),
-- 2023
(21, 1,  13, 2, 1,  '2023-01-15 09:00', N'Suivi HTA',            N'TA 145/90, légère amélioration',     N'Continuer traitement',N'Suivi',   25, 1),
(22, 2,  14, 3, 2,  '2023-01-28 10:30', N'Diabète suivi',        N'HbA1c 7.8%, amélioration',           N'Maintien traitement', N'Suivi',   20, 3),
(23, 3,  15, 2, 1,  '2023-02-10 14:00', N'HTA décompensée',      N'TA 175/110, aggravation',             N'Bisoprolol ajouté',  N'Urgence',  60, 1),
(24, 4,  16, 5, 9,  '2023-02-25 11:00', N'Anémie',               N'Fatigue, pâleur',                    N'Fer oral',           N'Standard', 30, 4),
(25, 5,  17, 2, 3,  '2023-03-12 09:30', N'Insuffisance cardiaque',N'Surveillance post-hospitalisation', N'Furosémide + Ramipril',N'Suivi',  40, 1),
(26, 6,  18, 7, 11, '2023-03-28 15:00', N'Pneumonie',            N'Fièvre 39°C, toux productive',       N'Augmentin 1g',       N'Urgence',  50, 5),
(27, 7,  19, 7, 10, '2023-04-10 10:00', N'Lombalgie chronique',  N'Suivi ostéopathie',                  N'Ibuprofène 400mg',   N'Suivi',    25, 5),
(28, 8,  20, 3, 2,  '2023-04-25 14:00', N'Diabète instable',     N'Hypoglycémies fréquentes',           N'Ajustement insuline',N'Urgence',  45, 3),
(29, 9,  21, 4, 7,  '2023-05-08 09:00', N'Migraine réfractaire', N'Crises fréquentes',                  N'Triptan prescrit',   N'Standard', 35, 1),
(30, 10, 22, 7, 6,  '2023-05-22 11:30', N'Eczéma exacerbé',      N'Flambée après stress',               N'Prednisolone + hydratation',N'Standard',30, 5),
(31, 11, 23, 4, 7,  '2023-06-05 10:00', N'Céphalées',            N'Migraine probable',                  N'Paracétamol 1g',     N'Standard', 20, 1),
(32, 12, 24, 2, 1,  '2023-06-20 09:00', N'Suivi HTA',            N'TA 155/95, stabilisation',           N'Continuer Bisoprolol',N'Suivi',   25, 1),
(33, 13, 25, 3, 8,  '2023-07-04 14:30', N'Hypothyroïdie',        N'TSH 7.2 mUI/L',                     N'Levothyrox 125µg',   N'Standard', 30, 3),
(34, 14, 26, 6, 5,  '2023-07-18 11:00', N'Douleur genou',        N'Arthrose débutante',                 N'Ibuprofène + kiné',  N'Standard', 35, 2),
(35, 15, 27, 5, 4,  '2023-08-02 10:00', N'Asthme sévère',        N'Hospitalisation recommandée',        N'Corticothérapie',    N'Urgence',  60, 4),
(36, 16, 28, 6, 5,  '2023-08-15 14:00', N'Suivi fracture fémur', N'Cicatrisation en cours',             N'Calcium + vitamine D',N'Suivi',  30, 2),
(37, 17, 29, 7, 15, '2023-09-01 09:30', N'Gastrite chronique',   N'Douleurs persistantes',              N'Pantoprazole 40mg',  N'Suivi',    25, 5),
(38, 18, 30, 4, 8,  '2023-09-15 10:00', N'Suivi hypothyroïdie',  N'TSH normalisée',                    N'Continuer Levothyrox',N'Suivi',   20, 1),
(39, 19, 31, 7, 9,  '2023-10-05 15:00', N'Anémie ferriprive',    N'Hb 9 g/dL',                         N'Fer IV',             N'Standard', 30, 5),
(40, 20, 32, 6, 5,  '2023-10-20 11:00', N'Post-op fracture',     N'Rééducation en cours',               N'Antalgiques légers', N'Suivi',    25, 2),
-- 2024
(41, 21, 33, 3, 2,  '2024-01-10 09:00', N'Diabète type 2',       N'Bilan semestriel',                   N'Metformine 850mg',   N'Suivi',    25, 3),
(42, 22, 34, 7, 12, '2024-01-25 10:30', N'Otite aiguë',          N'Douleur oreille droite',             N'Amoxicilline 500mg', N'Standard', 20, 5),
(43, 23, 35, 5, 6,  '2024-02-08 14:00', N'Eczéma',               N'Poussée dermatologique',             N'Prednisolone',        N'Standard', 30, 4),
(44, 24, 36, 7, 10, '2024-02-22 11:00', N'Lombalgie sévère',     N'Sciatique suspectée',                N'Tramadol + repos',   N'Urgence',  50, 5),
(45, 25, 37, 3, 2,  '2024-03-07 09:30', N'Diabète suivi',        N'HbA1c 6.9%, bon contrôle',          N'Maintien traitement', N'Suivi',   20, 3),
(46, 26, 38, 6, 5,  '2024-03-21 15:00', N'Douleur hanche',       N'Suspicion coxarthrose',              N'Radio + kiné',       N'Standard', 40, 2),
(47, 27, 39, 7, 14, '2024-04-05 10:00', N'Rhinite saisonnière',  N'Printemps, allergies polliniques',   N'Cétirizine 10mg',    N'Standard', 20, 5),
(48, 28, 40, 7, 10, '2024-04-20 14:00', N'Lombalgie',            N'Douleurs dorsales post-travail',     N'Ibuprofène',         N'Standard', 25, 5),
(49, 29, 41, 5, 9,  '2024-05-08 09:00', N'Anémie sévère',        N'Hb 7.5 g/dL',                      N'Fer IV + acide folique',N'Urgence',55, 4),
(50, 30, 42, 2, 1,  '2024-05-22 11:30', N'HTA',                  N'Contrôle annuel TA',                 N'Amlodipine 10mg',    N'Suivi',    25, 1),
(51, 1,  13, 2, 3,  '2024-06-05 09:00', N'Insuffisance cardiaque',N'Décompensation légère',             N'Furosémide 80mg',    N'Urgence',  55, 1),
(52, 2,  14, 3, 2,  '2024-06-19 10:30', N'Diabète déséquilibré', N'HbA1c 9.1%',                        N'Insulinothérapie',   N'Urgence',  45, 3),
(53, 3,  15, 4, 7,  '2024-07-03 14:00', N'Migraine',             N'Nouvelle plainte neurologique',      N'IRM cérébrale requis',N'Standard',40, 1),
(54, 4,  16, 5, 4,  '2024-07-17 11:00', N'Asthme',               N'Dyspnée nocturne',                   N'Corticoïde inhalé',  N'Standard', 35, 4),
(55, 5,  17, 2, 1,  '2024-08-01 09:30', N'HTA suivi',            N'TA stable 140/85',                  N'Continuer traitement',N'Suivi',   20, 1),
(56, 6,  18, 7, 11, '2024-08-15 15:00', N'Pneumonie bactérienne',N'Fièvre 40°C, hospitalisation',       N'Augmentin IV',       N'Urgence',  70, 5),
(57, 7,  19, 6, 10, '2024-09-01 10:00', N'Lombalgie + sciatique',N'IRM lombaire prescrite',            N'Tramadol + kiné',    N'Standard', 45, 2),
(58, 8,  20, 3, 8,  '2024-09-15 14:00', N'Hypothyroïdie',        N'TSH 8 mUI/L',                       N'Ajust. Levothyrox',  N'Suivi',    25, 3),
(59, 9,  21, 2, 3,  '2024-10-03 09:00', N'IC aiguë',             N'Décompensation cardiaque',           N'Hospitalisation',    N'Urgence',  80, 1),
(60, 10, 22, 5, 6,  '2024-10-18 11:30', N'Eczéma sévère',        N'Atteinte étendue',                  N'Immunosuppresseur',  N'Urgence',  50, 4),
-- 2025
(61, 11, 23, 4, 7,  '2025-01-08 10:00', N'Migraine chronique',   N'Prophylaxie envisagée',              N'Propranolol prescrit',N'Standard',35, 1),
(62, 12, 24, 2, 1,  '2025-01-22 09:00', N'HTA compliquée',       N'AVC léger suspect',                 N'Aspirine + IRM',     N'Urgence',  75, 1),
(63, 13, 25, 3, 2,  '2025-02-05 14:30', N'Diabète bilan',        N'Bilan annuel',                       N'Ajustement posologie',N'Suivi',   30, 3),
(64, 14, 26, 7, 15, '2025-02-20 11:00', N'Gastrite aiguë',       N'Douleurs intenses',                  N'Pantoprazole 40mg',  N'Urgence',  40, 5),
(65, 15, 27, 5, 13, '2025-03-07 10:00', N'Appendicite aiguë',    N'Douleur FID, chirurgie urgente',     N'Chirurgie',          N'Urgence',  20, 4),
(66, 16, 28, 6, 5,  '2025-03-21 14:00', N'Prothèse hanche',      N'Indication chirurgicale posée',      N'Antalgiques',        N'Standard', 45, 2),
(67, 17, 29, 7, 9,  '2025-04-04 09:30', N'Anémie chronique',     N'Bilan étiologique',                  N'Fer + vitamines',    N'Standard', 30, 5),
(68, 18, 30, 4, 8,  '2025-04-10 10:00', N'Hypothyroïdie suivi',  N'TSH normale 2.1',                   N'Continuer traitement',N'Suivi',   20, 1),
(69, 19, 31, 3, 2,  '2025-04-15 15:00', N'Diabète type 2',       N'Premier diagnostic',                 N'Metformine 500mg',   N'Standard', 40, 3),
(70, 20, 32, 6, 5,  '2025-04-18 11:00', N'Arthrose genou',       N'Gonarthrose bilatérale',             N'Kiné + AINS',        N'Suivi',    30, 2),
(71, 21, 33, 7, 10, '2025-01-20 09:00', N'Lombalgie',            N'Récidive lombaire',                  N'Tramadol',           N'Standard', 25, 5),
(72, 22, 34, 7, 12, '2025-02-10 10:30', N'Otite récidivante',    N'3ème épisode en 6 mois',            N'Amoxicilline',       N'Standard', 20, 5),
(73, 23, 35, 4, 7,  '2025-03-01 14:00', N'Migraine',             N'Prophylaxie en cours',               N'Propranolol',        N'Suivi',    25, 1),
(74, 24, 36, 7, 14, '2025-03-15 11:00', N'Rhinite',              N'Allergie persistante',               N'Antihistaminiques',  N'Suivi',    20, 5),
(75, 25, 37, 5, 9,  '2025-04-02 09:30', N'Anémie',               N'Bilan complet demandé',              N'Fer oral',           N'Standard', 30, 4);
SET IDENTITY_INSERT Consultations OFF;
GO

-- ============================================================
-- 11. ORDONNANCES (58)
-- ============================================================
SET IDENTITY_INSERT Ordonnances ON;
INSERT INTO Ordonnances (OrdonnanceID, ConsultationID, DMEID, PatientID, MedecinID, MedicamentID, Posologie, DureeTrt, DatePrescription, Instructions) VALUES
(1,  1,  1,  13, 2, 4,  N'1 cp/j matin',       N'30 jours',  '2022-03-10', N'Prendre le matin à jeun'),
(2,  2,  2,  14, 3, 3,  N'1 cp x 2/j',         N'90 jours',  '2022-03-15', N'Avec les repas'),
(3,  3,  3,  15, 2, 10, N'1 cp/j',             N'30 jours',  '2022-04-01', N'Le matin'),
(4,  4,  4,  16, 5, 12, N'1 cp x 3/j',         N'5 jours',   '2022-04-20', N'Avec nourriture'),
(5,  5,  5,  17, 2, 9,  N'1 cp/j',             N'14 jours',  '2022-05-05', N'Le matin'),
(6,  5,  5,  17, 2, 10, N'1 cp/j',             N'30 jours',  '2022-05-05', N'En complément'),
(7,  6,  6,  18, 7, 11, N'1 cp/j',             N'15 jours',  '2022-05-20', N'Le soir au coucher'),
(8,  7,  7,  19, 7, 12, N'1 cp x 3/j',         N'7 jours',   '2022-06-08', N'Avec repas, max 5 jours'),
(9,  8,  8,  20, 3, 16, N'10 UI le soir',      N'60 jours',  '2022-06-22', N'Injection sous-cutanée'),
(10, 9,  9,  21, 4, 19, N'1 gél x 2/j',        N'5 jours',   '2022-07-05', N'Ne pas conduire'),
(11, 10, 10, 22, 7, 20, N'1 cp/j pendant 5j', N'5 jours',   '2022-07-18', N'Avec repas'),
(12, 11, 11, 23, 7, 11, N'1 cp/j',             N'30 jours',  '2022-08-02', N'Le soir'),
(13, 12, 12, 24, 2, 14, N'1 cp/j matin',       N'60 jours',  '2022-08-15', N'Même heure chaque jour'),
(14, 12, 12, 24, 2, 17, N'1 sachet/j',         N'90 jours',  '2022-08-15', N'Antiagrégant, long terme'),
(15, 13, 13, 25, 3, 3,  N'1 cp x 2/j',         N'90 jours',  '2022-09-01', N'Avec repas'),
(16, 14, 14, 26, 7, 19, N'1 gél x 3/j',        N'5 jours',   '2022-09-20', N'Max 5 jours'),
(17, 15, 15, 27, 5, 20, N'1 cp/j',             N'7 jours',   '2022-10-10', N'Diminuer progressivement'),
(18, 16, 16, 28, 6, 1,  N'2 cp x 3/j',         N'5 jours',   '2022-10-25', N'Antalgique'),
(19, 17, 17, 29, 7, 6,  N'1 gél/j avant repas',N'30 jours',  '2022-11-08', N'Avant le petit déjeuner'),
(20, 18, 18, 30, 4, 15, N'1 cp/j matin',       N'90 jours',  '2022-11-22', N'A jeun, même heure'),
(21, 19, 19, 31, 7, 11, N'1 cp/j',             N'30 jours',  '2022-12-05', N'Le soir'),
(22, 20, 20, 32, 6, 18, N'1 cp x 4/j',         N'3 jours',   '2022-12-18', N'Ne pas dépasser la dose'),
(23, 21, 1,  13, 2, 4,  N'1 cp/j matin',       N'30 jours',  '2023-01-15', N'Continuer traitement'),
(24, 22, 2,  14, 3, 3,  N'1 cp x 2/j',         N'90 jours',  '2023-01-28', N'Avec repas'),
(25, 23, 3,  15, 2, 14, N'1 cp/j',             N'60 jours',  '2023-02-10', N'Matin à jeun'),
(26, 24, 4,  16, 5, 7,  N'2 cp x 3/j',         N'7 jours',   '2023-02-25', N'Avec repas'),
(27, 25, 5,  17, 2, 9,  N'1 cp/j',             N'30 jours',  '2023-03-12', N'Le matin'),
(28, 26, 6,  18, 7, 8,  N'1 cp x 2/j',         N'10 jours',  '2023-03-28', N'Compléter le traitement'),
(29, 27, 7,  19, 7, 12, N'1 cp x 3/j',         N'5 jours',   '2023-04-10', N'Avec repas'),
(30, 28, 8,  20, 3, 16, N'12 UI le soir',      N'60 jours',  '2023-04-25', N'Ajustement posologie'),
(31, 29, 9,  21, 4, 19, N'1 gél x 2/j',        N'5 jours',   '2023-05-08', N'Ne pas conduire'),
(32, 30, 10, 22, 7, 20, N'1 cp/j',             N'5 jours',   '2023-05-22', N'Avec repas'),
(33, 31, 11, 23, 4, 7,  N'2 cp x 3/j',         N'5 jours',   '2023-06-05', N'Avec repas'),
(34, 32, 12, 24, 2, 14, N'1 cp/j',             N'60 jours',  '2023-06-20', N'Continuer'),
(35, 33, 13, 25, 3, 15, N'1 cp/j matin',       N'90 jours',  '2023-07-04', N'A jeun'),
(36, 34, 14, 26, 6, 12, N'1 cp x 2/j',         N'7 jours',   '2023-07-18', N'Avec repas'),
(37, 35, 15, 27, 5, 20, N'1 cp/j',             N'10 jours',  '2023-08-02', N'Décroissance progressive'),
(38, 37, 17, 29, 7, 13, N'1 cp/j avant repas', N'30 jours',  '2023-09-01', N'Avant petit déjeuner'),
(39, 38, 18, 30, 4, 15, N'1 cp/j matin',       N'90 jours',  '2023-09-15', N'Continuer'),
(40, 41, 21, 33, 3, 3,  N'1 cp x 2/j',         N'90 jours',  '2024-01-10', N'Avec repas'),
(41, 42, 22, 34, 7, 2,  N'1 gél x 3/j',        N'7 jours',   '2024-01-25', N'Terminer le traitement'),
(42, 43, 23, 35, 5, 20, N'1 cp/j',             N'7 jours',   '2024-02-08', N'Avec repas'),
(43, 44, 24, 36, 7, 19, N'1 gél x 2/j',        N'5 jours',   '2024-02-22', N'Ne pas conduire'),
(44, 47, 27, 39, 7, 11, N'1 cp/j',             N'30 jours',  '2024-04-05', N'Le soir'),
(45, 48, 28, 40, 7, 12, N'1 cp x 3/j',         N'7 jours',   '2024-04-20', N'Avec repas'),
(46, 50, 30, 42, 2, 4,  N'1 cp/j matin',       N'30 jours',  '2024-05-22', N'Le matin'),
(47, 51, 1,  13, 2, 9,  N'2 cp/j',             N'14 jours',  '2024-06-05', N'Surveillance rénale'),
(48, 52, 2,  14, 3, 16, N'10 UI/j',            N'60 jours',  '2024-06-19', N'Injection SC'),
(49, 55, 5,  17, 2, 4,  N'1 cp/j',             N'30 jours',  '2024-08-01', N'Le matin'),
(50, 56, 6,  18, 7, 8,  N'1 cp x 3/j',         N'14 jours',  '2024-08-15', N'Compléter'),
(51, 61, 11, 23, 4, 7,  N'2 cp x 3/j',         N'5 jours',   '2025-01-08', N'Avec repas'),
(52, 62, 12, 24, 2, 17, N'1 sachet/j',         N'90 jours',  '2025-01-22', N'Long terme'),
(53, 63, 13, 25, 3, 3,  N'1 cp x 2/j',         N'90 jours',  '2025-02-05', N'Avec repas'),
(54, 64, 14, 26, 7, 13, N'1 cp/j',             N'30 jours',  '2025-02-20', N'Avant repas'),
(55, 67, 17, 29, 7, 1,  N'2 cp x 3/j',         N'7 jours',   '2025-04-04', N'Avec repas'),
(56, 68, 18, 30, 4, 15, N'1 cp/j matin',       N'90 jours',  '2025-04-10', N'Continuer'),
(57, 69, 19, 31, 3, 3,  N'1 cp/j',             N'30 jours',  '2025-04-15', N'Initiation traitement'),
(58, 75, 25, 37, 5, 7,  N'2 cp x 3/j',         N'7 jours',   '2025-04-02', N'Avec repas');
SET IDENTITY_INSERT Ordonnances OFF;
GO

-- ============================================================
-- 12. DEMANDES D'ANALYSE (48)
-- ============================================================
SET IDENTITY_INSERT DemandesAnalyse ON;
INSERT INTO DemandesAnalyse (DemandeID, DMEID, PatientID, MedecinID, LaboratoireID, TypeAnalyseID, DateDemande, Urgence, Description, Statut) VALUES
(1,  1,  13, 2,  11, 1,  '2022-03-10', 0, N'Glycémie à jeun contrôle',          N'Terminé'),
(2,  2,  14, 3,  12, 10, '2022-03-15', 0, N'HbA1c bilan diabète',               N'Terminé'),
(3,  3,  15, 2,  11, 2,  '2022-04-01', 1, N'NFS urgence',                       N'Terminé'),
(4,  5,  17, 2,  11, 2,  '2022-05-05', 1, N'NFS + bilan cardiaque',              N'Terminé'),
(5,  8,  20, 3,  12, 10, '2022-06-22', 0, N'HbA1c semestriel',                  N'Terminé'),
(6,  12, 24, 2,  11, 1,  '2022-08-15', 1, N'Glycémie urgence HTA',              N'Terminé'),
(7,  13, 25, 3,  12, 10, '2022-09-01', 0, N'HbA1c annuel',                      N'Terminé'),
(8,  18, 30, 4,  11, 4,  '2022-11-22', 0, N'TSH bilan thyroïde',                N'Terminé'),
(9,  1,  13, 2,  11, 3,  '2023-01-15', 0, N'Bilan lipidique annuel',            N'Terminé'),
(10, 2,  14, 3,  12, 10, '2023-01-28', 0, N'HbA1c contrôle',                   N'Terminé'),
(11, 3,  15, 2,  11, 2,  '2023-02-10', 1, N'NFS urgence HTA',                  N'Terminé'),
(12, 4,  16, 5,  12, 2,  '2023-02-25', 0, N'NFS anémie suspectée',             N'Terminé'),
(13, 6,  18, 7,  11, 9,  '2023-03-28', 1, N'CRP pneumonie',                    N'Terminé'),
(14, 8,  20, 3,  12, 10, '2023-04-25', 1, N'HbA1c urgence diabète',            N'Terminé'),
(15, 9,  21, 4,  11, 1,  '2023-05-08', 0, N'Glycémie bilan',                   N'Terminé'),
(16, 12, 24, 2,  11, 3,  '2023-06-20', 0, N'Bilan lipidique',                  N'Terminé'),
(17, 13, 25, 3,  12, 4,  '2023-07-04', 0, N'TSH hypothyroïdie',                N'Terminé'),
(18, 21, 33, 3,  12, 10, '2024-01-10', 0, N'HbA1c annuel',                     N'Terminé'),
(19, 22, 34, 7,  11, 2,  '2024-01-25', 0, N'NFS infection',                    N'Terminé'),
(20, 24, 36, 7,  11, 9,  '2024-02-22', 1, N'CRP lombalgie',                    N'Terminé'),
(21, 25, 37, 3,  12, 10, '2024-03-07', 0, N'HbA1c contrôle',                   N'Terminé'),
(22, 28, 40, 7,  11, 5,  '2024-04-20', 0, N'Créatinine bilan rénal',           N'Terminé'),
(23, 30, 42, 2,  11, 3,  '2024-05-22', 0, N'Bilan lipidique',                  N'Terminé'),
(24, 1,  13, 2,  11, 9,  '2024-06-05', 1, N'CRP insuffisance cardiaque',       N'Terminé'),
(25, 2,  14, 3,  12, 1,  '2024-06-19', 1, N'Glycémie urgence',                 N'Terminé'),
(26, 3,  15, 4,  11, 2,  '2024-07-03', 0, N'NFS bilan général',                N'Terminé'),
(27, 5,  17, 2,  11, 6,  '2024-08-01', 0, N'ASAT bilan hépatique',             N'Terminé'),
(28, 6,  18, 7,  11, 9,  '2024-08-15', 1, N'CRP pneumonie',                    N'Terminé'),
(29, 9,  21, 2,  11, 2,  '2024-10-03', 1, N'NFS urgence cardiaque',            N'Terminé'),
(30, 10, 22, 5,  12, 2,  '2024-10-18', 0, N'NFS eczéma',                       N'Terminé'),
(31, 11, 23, 4,  11, 1,  '2025-01-08', 0, N'Glycémie bilan',                   N'Terminé'),
(32, 12, 24, 2,  11, 3,  '2025-01-22', 1, N'Bilan lipidique urgence',          N'Terminé'),
(33, 13, 25, 3,  12, 10, '2025-02-05', 0, N'HbA1c annuel',                     N'Terminé'),
(34, 17, 29, 7,  11, 2,  '2025-04-04', 0, N'NFS anémie',                       N'En attente'),
(35, 18, 30, 4,  11, 4,  '2025-04-10', 0, N'TSH suivi thyroïde',               N'En attente'),
(36, 19, 31, 3,  12, 10, '2025-04-15', 0, N'HbA1c début diabète',             N'En attente'),
(37, 25, 37, 5,  12, 2,  '2025-04-02', 0, N'NFS anémie bilan',                 N'En cours'),
(38, 1,  13, 2,  11, 7,  '2023-01-15', 0, N'ALAT bilan hépatique',             N'Terminé'),
(39, 2,  14, 3,  12, 5,  '2023-01-28', 0, N'Créatinine bilan rénal',           N'Terminé'),
(40, 5,  17, 2,  11, 8,  '2023-03-12', 0, N'INR traitement anticoagulant',     N'Terminé'),
(41, 12, 24, 2,  11, 11, '2023-06-20', 0, N'Ionogramme bilan cardiovasculaire',N'Terminé'),
(42, 13, 25, 3,  12, 12, '2023-07-04', 0, N'PSA bilan prostate',               N'Terminé'),
(43, 3,  15, 2,  11, 5,  '2024-07-03', 0, N'Créatinine fonction rénale',       N'Terminé'),
(44, 9,  21, 2,  11, 3,  '2024-10-03', 0, N'Bilan lipidique cardiaque',        N'Terminé'),
(45, 30, 42, 2,  11, 6,  '2024-05-22', 0, N'ASAT bilan hépatique',             N'Terminé'),
(46, 21, 33, 3,  12, 4,  '2024-01-10', 0, N'TSH hypothyroïdie suspectée',      N'Terminé'),
(47, 22, 34, 7,  11, 9,  '2024-01-25', 1, N'CRP infection',                    N'Terminé'),
(48, 4,  16, 5,  12, 2,  '2024-07-17', 0, N'NFS asthme',                       N'Terminé');
SET IDENTITY_INSERT DemandesAnalyse OFF;
GO

-- ============================================================
-- 13. RÉSULTATS D'ANALYSE (37)
-- ============================================================
SET IDENTITY_INSERT ResultatsAnalyse ON;
INSERT INTO ResultatsAnalyse (ResultatID, DemandeID, LaboratoireID, Valeur, Unite, Resultat, Interpretation, DateResultat, Anormal) VALUES
(1,  1,  11, 1.250, N'g/L',    N'Glycémie 1.25 g/L',       N'Légèrement élevée, surveiller',         '2022-03-11', 1),
(2,  2,  12, 8.200, N'%',      N'HbA1c 8.2%',              N'Diabète déséquilibré',                   '2022-03-16', 1),
(3,  3,  11, 5.800, N'10^9/L', N'Leucocytes 5.8 x10^9/L', N'Normal',                                 '2022-04-01', 0),
(4,  4,  11, 4.200, N'10^9/L', N'Leucocytes 4.2 x10^9/L', N'Normal',                                 '2022-05-06', 0),
(5,  5,  12, 9.100, N'%',      N'HbA1c 9.1%',              N'Diabète très déséquilibré',              '2022-06-23', 1),
(6,  6,  11, 1.450, N'g/L',    N'Glycémie 1.45 g/L',       N'Élevée, risque cardiovasculaire',        '2022-08-15', 1),
(7,  7,  12, 7.800, N'%',      N'HbA1c 7.8%',              N'Diabète insuffisamment équilibré',       '2022-09-02', 1),
(8,  8,  11, 7.200, N'mUI/L',  N'TSH 7.2 mUI/L',           N'Hypothyroïdie confirmée',                '2022-11-23', 1),
(9,  9,  11, 2.100, N'g/L',    N'LDL 2.1 g/L',             N'Hypercholestérolémie',                   '2023-01-16', 1),
(10, 10, 12, 7.500, N'%',      N'HbA1c 7.5%',              N'Amélioration, objectif non atteint',     '2023-01-29', 1),
(11, 11, 11, 11.200,N'10^9/L', N'Leucocytes 11.2 x10^9/L',N'Hyperleucocytose, infection probable',   '2023-02-11', 1),
(12, 12, 12, 3.100, N'10^9/L', N'Leucocytes 3.1 x10^9/L', N'Leucopénie légère',                      '2023-02-26', 1),
(13, 13, 11, 48.000,N'mg/L',   N'CRP 48 mg/L',             N'Syndrome inflammatoire important',       '2023-03-29', 1),
(14, 14, 12, 9.100, N'%',      N'HbA1c 9.1%',              N'Diabète déséquilibré, revoir traitement','2023-04-26', 1),
(15, 15, 11, 0.950, N'g/L',    N'Glycémie 0.95 g/L',       N'Normal',                                 '2023-05-09', 0),
(16, 16, 11, 1.800, N'g/L',    N'LDL 1.8 g/L',             N'Élevé, risque cardiovasculaire',         '2023-06-21', 1),
(17, 17, 12, 7.200, N'mUI/L',  N'TSH 7.2 mUI/L',           N'Hypothyroïdie mal contrôlée',            '2023-07-05', 1),
(18, 18, 12, 6.900, N'%',      N'HbA1c 6.9%',              N'Bon contrôle diabète',                   '2024-01-11', 0),
(19, 19, 11, 12.500,N'10^9/L', N'Leucocytes 12.5 x10^9/L',N'Infection bactérienne probable',         '2024-01-26', 1),
(20, 20, 11, 22.000,N'mg/L',   N'CRP 22 mg/L',             N'Inflammation modérée',                   '2024-02-23', 1),
(21, 21, 12, 6.800, N'%',      N'HbA1c 6.8%',              N'Diabète bien équilibré',                 '2024-03-08', 0),
(22, 22, 11, 10.500,N'mg/L',   N'Créatinine 10.5 mg/L',   N'Légèrement élevée, surveillance',        '2024-04-21', 1),
(23, 23, 11, 1.600, N'g/L',    N'LDL 1.6 g/L',             N'Limite haute, surveiller',               '2024-05-23', 0),
(24, 24, 11, 35.000,N'mg/L',   N'CRP 35 mg/L',             N'Inflammation significative',             '2024-06-06', 1),
(25, 25, 12, 3.200, N'g/L',    N'Glycémie 3.2 g/L',        N'Hyperglycémie sévère',                   '2024-06-20', 1),
(26, 26, 11, 7.500, N'10^9/L', N'Leucocytes 7.5 x10^9/L', N'Normal',                                 '2024-07-04', 0),
(27, 27, 11, 42.000,N'UI/L',   N'ASAT 42 UI/L',            N'Légèrement élevée',                      '2024-08-02', 1),
(28, 28, 11, 68.000,N'mg/L',   N'CRP 68 mg/L',             N'Infection sévère confirmée',             '2024-08-16', 1),
(29, 29, 11, 8.900, N'10^9/L', N'Leucocytes 8.9 x10^9/L', N'Normal',                                 '2024-10-04', 0),
(30, 30, 12, 5.200, N'10^9/L', N'Leucocytes 5.2 x10^9/L', N'Normal',                                 '2024-10-19', 0),
(31, 31, 11, 0.880, N'g/L',    N'Glycémie 0.88 g/L',       N'Normal',                                 '2025-01-09', 0),
(32, 32, 11, 1.950, N'g/L',    N'LDL 1.95 g/L',            N'Élevé',                                  '2025-01-23', 1),
(33, 33, 12, 7.100, N'%',      N'HbA1c 7.1%',              N'Diabète légèrement déséquilibré',        '2025-02-06', 1),
(34, 38, 11, 35.000,N'UI/L',   N'ALAT 35 UI/L',            N'Normal',                                 '2023-01-16', 0),
(35, 39, 12, 8.500, N'mg/L',   N'Créatinine 8.5 mg/L',     N'Normal',                                 '2023-01-29', 0),
(36, 40, 11, 1.100, N'ratio',  N'INR 1.1',                  N'Normal, pas d''anticoagulation',         '2023-03-13', 0),
(37, 47, 11, 45.000,N'mg/L',   N'CRP 45 mg/L',             N'Infection confirmée',                    '2024-01-26', 1);
SET IDENTITY_INSERT ResultatsAnalyse OFF;
GO

-- ============================================================
-- 14. OBSERVATIONS INFIRMIÈRES (22)
-- ============================================================
SET IDENTITY_INSERT Observations ON;
INSERT INTO Observations (ObservationID, DMEID, PatientID, InfirmierID, Contenu, TensionArterielle, Temperature, PoulsMin, Poids, DateObservation) VALUES
(1,  1,  13, 8,  N'Patient stable, tension contrôlée',                N'140/90',  37.2, 72, 78.5, '2022-03-10 09:30'),
(2,  5,  17, 8,  N'Dyspnée légère, surveillance cardio',              N'150/100', 37.5, 90, 85.0, '2022-05-05 10:00'),
(3,  2,  14, 9,  N'Glycémie élevée, patient informé',                 N'130/85',  36.8, 78, 72.0, '2022-06-22 14:30'),
(4,  12, 24, 8,  N'HTA sévère, repos prescrit',                       N'170/110', 37.0, 88, 90.0, '2022-08-15 09:30'),
(5,  3,  15, 9,  N'Céphalées, patient couché',                        N'165/105', 37.3, 85, 82.0, '2023-02-10 14:30'),
(6,  6,  18, 10, N'Fièvre persistante, pneumonie',                    N'120/80',  39.2, 95, 58.0, '2023-03-28 15:30'),
(7,  20, 32, 9,  N'Post-op fracture, douleurs contrôlées',            N'125/80',  37.1, 75, 88.0, '2022-12-18 12:00'),
(8,  15, 27, 10, N'Asthme aigu, bronchospasme',                       N'110/70',  37.8, 105, 55.0, '2022-10-10 10:30'),
(9,  1,  13, 8,  N'Suivi HTA, amélioration tension',                  N'145/90',  36.9, 70, 79.0, '2023-01-15 09:30'),
(10, 9,  21, 8,  N'Migraine sévère, lumière intolérable',             N'120/75',  37.0, 88, 75.0, '2023-05-08 09:30'),
(11, 5,  17, 8,  N'IC décompensée, oedèmes membres inf.',             N'145/95',  37.2, 92, 87.0, '2023-03-12 10:00'),
(12, 35, 35, 10, N'Asthme sévère, oxygénothérapie',                  N'115/75',  38.0, 110, 53.0, '2023-08-02 10:30'),
(13, 2,  14, 9,  N'Diabète instable, hypoglycémie traitée',          N'125/80',  36.5, 82, 71.0, '2023-04-25 14:30'),
(14, 10, 22, 9,  N'Eczéma sévère, démangeaisons importantes',        N'120/78',  36.7, 76, 65.0, '2023-05-22 11:30'),
(15, 1,  13, 8,  N'IC légère, surveillance diurèse',                  N'155/100', 37.0, 88, 80.0, '2024-06-05 09:30'),
(16, 9,  21, 8,  N'IC aiguë, hospitalisation nécessaire',            N'160/105', 37.3, 95, 82.0, '2024-10-03 09:30'),
(17, 6,  18, 10, N'Pneumonie sévère, fièvre 40°C',                   N'115/75',  40.1, 102, 57.0, '2024-08-15 15:30'),
(18, 12, 24, 8,  N'Post-AVC, surveillance neurologique',              N'155/100', 37.0, 80, 89.0, '2025-01-22 09:30'),
(19, 15, 27, 10, N'Post-appendicectomie, douleurs contrôlées',       N'118/76',  37.5, 85, 54.0, '2025-03-07 10:30'),
(20, 29, 41, 10, N'Anémie sévère, pâleur marquée',                   N'105/65',  36.8, 98, 52.0, '2024-05-08 09:30'),
(21, 4,  16, 10, N'Asthme nocturne, traitement inhalé',              N'112/72',  37.2, 96, 61.0, '2024-07-17 11:30'),
(22, 21, 33, 9,  N'Bilan annuel diabète, poids stable',               N'128/82',  36.9, 74, 68.0, '2024-01-10 09:30');
SET IDENTITY_INSERT Observations OFF;
GO

-- ============================================================
-- 15. HOSPITALISATIONS (12)
-- ============================================================
SET IDENTITY_INSERT Hospitalisations ON;
INSERT INTO Hospitalisations (HospitalisationID, PatientID, DMEID, HopitalID, MedecinID, DateEntree, DateSortie, Service, MotifEntree, DiagnosticID, CoutSejour) VALUES
(1,  17, 5,  1, 2, '2022-05-05', '2022-05-12', N'Cardiologie',   N'Insuffisance cardiaque décompensée', 3,  2800.00),
(2,  32, 20, 2, 6, '2022-12-18', '2022-12-28', N'Orthopédie',    N'Fracture fémur chirurgie',           5,  8500.00),
(3,  15, 3,  1, 2, '2023-02-10', '2023-02-15', N'Cardiologie',   N'HTA sévère décompensée',             1,  2200.00),
(4,  27, 15, 4, 5, '2023-08-02', '2023-08-07', N'Médecine interne',N'Asthme sévère',                  4,  1800.00),
(5,  20, 8,  3, 3, '2023-04-25', '2023-05-01', N'Endocrinologie',N'Diabète déséquilibré',              2,  2100.00),
(6,  22, 10, 4, 5, '2024-10-18', '2024-10-25', N'Dermatologie',  N'Eczéma sévère résistant',           6,  3200.00),
(7,  21, 9,  1, 2, '2024-10-03', '2024-10-10', N'Cardiologie',   N'IC aiguë décompensée',              3,  3500.00),
(8,  18, 6,  5, 7, '2024-08-15', '2024-08-22', N'Médecine interne',N'Pneumonie sévère',               11, 2600.00),
(9,  41, 29, 4, 5, '2024-05-08', '2024-05-12', N'Hématologie',   N'Anémie sévère, transfusion',        9,  2900.00),
(10, 27, 15, 4, 5, '2025-03-07', '2025-03-10', N'Chirurgie générale',N'Appendicite aiguë, opérée',    13, 4200.00),
(11, 14, 2,  3, 3, '2024-06-19', '2024-06-24', N'Endocrinologie',N'Diabète déséquilibré',              2,  1900.00),
(12, 13, 1,  1, 2, '2024-06-05', '2024-06-08', N'Cardiologie',   N'Insuffisance cardiaque légère',     3,  1500.00);
SET IDENTITY_INSERT Hospitalisations OFF;
GO

-- ============================================================
-- 16. MESSAGES (15)
-- ============================================================
SET IDENTITY_INSERT Messages ON;
INSERT INTO Messages (MessageID, ExpediteurID, DestinataireID, Contenu, DateEnvoi, Lu) VALUES
(1,  2,  13, N'Bonjour M. Bouzid, vos résultats sont reçus. Votre tension est mieux contrôlée.',                  '2022-03-12 10:00', 1),
(2,  13, 2,  N'Merci Docteur Ben Ali, j''ai bien pris le médicament.',                                            '2022-03-12 14:00', 1),
(3,  3,  14, N'Mme Manai, votre HbA1c est à 8.2%. Nous devons ajuster votre traitement.',                         '2022-03-17 09:00', 1),
(4,  11, 2,  N'Dr Ben Ali, les résultats de glycémie de votre patient Ahmed Bouzid sont disponibles.',            '2022-03-11 16:00', 1),
(5,  2,  11, N'Merci BioLab, j''ai bien reçu les résultats.',                                                     '2022-03-11 17:00', 1),
(6,  5,  16, N'Mme Ben Youssef, votre bilan montre une anémie ferriprive. Traitement prescrit.',                  '2023-02-26 11:00', 1),
(7,  7,  18, N'Mme Mabrouk, votre pneumonie nécessite un traitement antibiotique immédiat.',                      '2023-03-28 16:00', 1),
(8,  2,  3,  N'Dr Maatoug, pouvez-vous voir le patient Khalfallah pour une 2ème opinion cardiologique ?',         '2023-02-12 10:00', 1),
(9,  3,  2,  N'Bien sûr Dr Ben Ali, je prends en charge le patient demain matin.',                                '2023-02-12 11:00', 1),
(10, 4,  21, N'M. Haddad, votre migraine nécessite une consultation neurologique urgente.',                       '2023-05-09 10:00', 0),
(11, 12, 3,  N'Dr Maatoug, les résultats HbA1c de Mme Manai sont disponibles : 9.1%.',                           '2023-04-26 14:00', 1),
(12, 6,  28, N'M. Mrabet, votre suivi de fracture montre une bonne évolution. Continuez la rééducation.',        '2023-08-16 09:00', 1),
(13, 2,  24, N'M. Jemli, votre HTA est sévère. Je vous recommande une consultation urgente.',                    '2023-06-21 10:00', 1),
(14, 1,  2,  N'Dr Ben Ali, rappel : mise à jour des protocoles HTA disponible sur la plateforme.',               '2024-01-10 08:00', 1),
(15, 7,  39, N'Mme Hachani, vos allergies printanières sont confirmées. Traitement adapté prescrit.',            '2024-04-06 10:00', 0);
SET IDENTITY_INSERT Messages OFF;
GO

-- ============================================================
-- 17. LOGS D'ACCÈS (30)
-- ============================================================
SET IDENTITY_INSERT LogsAcces ON;
INSERT INTO LogsAcces (LogID, UtilisateurID, Action, DateAction, IPAdresse, Details) VALUES
(1,  1,  N'CONNEXION',           '2022-01-15 08:00', N'192.168.1.1',  N'Première connexion admin'),
(2,  2,  N'CONNEXION',           '2022-03-10 08:30', N'192.168.1.10', N'Connexion médecin'),
(3,  2,  N'CONSULTATION_CREATE', '2022-03-10 09:00', N'192.168.1.10', N'Création consultation #1'),
(4,  3,  N'CONNEXION',           '2022-03-15 10:00', N'192.168.1.11', N'Connexion médecin'),
(5,  11, N'CONNEXION',           '2022-03-11 15:00', N'192.168.2.1',  N'Connexion laboratoire BioLab'),
(6,  11, N'RESULTAT_CREATE',     '2022-03-11 15:30', N'192.168.2.1',  N'Publication résultat #1'),
(7,  13, N'CONNEXION',           '2022-03-12 14:00', N'10.0.0.5',     N'Connexion patient'),
(8,  13, N'DME_VIEW',            '2022-03-12 14:05', N'10.0.0.5',     N'Consultation DME personnel'),
(9,  2,  N'ORDONNANCE_CREATE',   '2022-05-05 09:15', N'192.168.1.10', N'Ordonnance #5 créée'),
(10, 4,  N'CONNEXION',           '2022-07-05 08:45', N'192.168.1.12', N'Connexion neurologue'),
(11, 5,  N'CONNEXION',           '2022-10-10 09:00', N'192.168.1.13', N'Connexion gynécologue'),
(12, 8,  N'CONNEXION',           '2022-05-05 09:45', N'192.168.1.20', N'Connexion infirmière'),
(13, 8,  N'OBSERVATION_CREATE',  '2022-05-05 10:00', N'192.168.1.20', N'Observation #2 créée'),
(14, 6,  N'CONNEXION',           '2022-10-25 13:30', N'192.168.1.14', N'Connexion orthopédiste'),
(15, 1,  N'USER_CREATE',         '2023-01-05 09:00', N'192.168.1.1',  N'Création utilisateur patient #33'),
(16, 2,  N'DEMANDE_CREATE',      '2023-01-15 09:05', N'192.168.1.10', N'Demande analyse #9'),
(17, 12, N'CONNEXION',           '2023-01-15 14:00', N'192.168.2.2',  N'Connexion LabCentral Sfax'),
(18, 3,  N'DME_UPDATE',          '2023-04-25 14:10', N'192.168.1.11', N'Mise à jour DME patient #20'),
(19, 9,  N'CONNEXION',           '2023-03-28 15:00', N'192.168.1.21', N'Connexion infirmier'),
(20, 9,  N'OBSERVATION_CREATE',  '2023-03-28 15:30', N'192.168.1.21', N'Observation pneumonie'),
(21, 7,  N'CONNEXION',           '2024-01-25 10:00', N'192.168.1.15', N'Connexion médecin généraliste'),
(22, 2,  N'HOSPITALISATION_CREATE','2024-06-05 09:10',N'192.168.1.10',N'Hospitalisation IC #12'),
(23, 3,  N'CONNEXION',           '2024-06-19 10:00', N'192.168.1.11', N'Connexion endocrinologue'),
(24, 14, N'CONNEXION',           '2024-06-20 11:00', N'10.0.0.6',     N'Connexion patient Manai'),
(25, 14, N'RESULTAT_VIEW',       '2024-06-20 11:05', N'10.0.0.6',     N'Consultation résultats diabète'),
(26, 1,  N'RAPPORT_GENERATE',    '2024-07-01 09:00', N'192.168.1.1',  N'Génération rapport mensuel'),
(27, 2,  N'CONNEXION',           '2025-01-22 09:00', N'192.168.1.10', N'Connexion cardiologue'),
(28, 4,  N'CONSULTATION_CREATE', '2025-01-08 10:05', N'192.168.1.12', N'Consultation migraine #61'),
(29, 13, N'CONNEXION',           '2025-01-10 10:00', N'10.0.0.5',     N'Connexion patient Bouzid'),
(30, 1,  N'CONNEXION',           '2025-04-20 08:00', N'192.168.1.1',  N'Connexion admin maintenance');
SET IDENTITY_INSERT LogsAcces OFF;
GO

PRINT 'Données DME_SourceDB insérées avec succès - 30 patients, 75 consultations, 58 ordonnances, 48 demandes, 37 résultats, 22 observations, 12 hospitalisations, 15 messages, 30 logs.';
GO
