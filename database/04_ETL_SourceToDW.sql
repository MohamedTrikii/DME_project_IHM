-- ============================================================
-- Fichier : 04_ETL_SourceToDW.sql
-- Description : Script ETL complet - Source OLTP vers Data Warehouse
--               Extraction, Transformation et Chargement (ETL)
-- Projet : Business Intelligence - Système DME Tunisien
-- Cours : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================
-- Ordre d'exécution :
--   1. Peupler Dim_Date
--   2. Peupler les dimensions
--   3. Peupler les tables de faits
--   4. Afficher les statistiques
-- ============================================================

USE DME_DataWarehouse;
GO

PRINT '==================================================';
PRINT 'DÉBUT DU PROCESSUS ETL - DME_SourceDB -> DME_DataWarehouse';
PRINT CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '==================================================';
GO

-- ============================================================
-- ÉTAPE 1 : PEUPLER Dim_Date via la procédure stockée
-- ============================================================
PRINT '';
PRINT '--- ÉTAPE 1 : Peuplement de Dim_Date (2020-2026) ---';

EXEC sp_Remplir_Dim_Date @AnneeDebut = 2020, @AnneeFin = 2026;
GO

-- ============================================================
-- ÉTAPE 2 : PEUPLER LES DIMENSIONS depuis DME_SourceDB
-- ============================================================

-- -------------------------------------------------------
-- 2.1 Dim_Gouvernorat
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.1 : Peuplement de Dim_Gouvernorat ---';

TRUNCATE TABLE Dim_Gouvernorat;

INSERT INTO Dim_Gouvernorat (GouvernoratID, Nom, Region)
SELECT
    g.GouvernoratID,
    g.Nom,
    -- Attribution de la région géographique tunisienne
    Region = CASE g.Nom
        WHEN N'Tunis'    THEN N'Nord'
        WHEN N'Ariana'   THEN N'Nord'
        WHEN N'Bizerte'  THEN N'Nord'
        WHEN N'Nabeul'   THEN N'Côtière'
        WHEN N'Sousse'   THEN N'Côtière'
        WHEN N'Monastir' THEN N'Côtière'
        WHEN N'Sfax'     THEN N'Centre'
        WHEN N'Kairouan' THEN N'Centre'
        ELSE N'Centre'
    END
FROM DME_SourceDB.dbo.Gouvernorats g;

PRINT CONCAT('  -> Dim_Gouvernorat : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.2 Dim_Specialite
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.2 : Peuplement de Dim_Specialite ---';

TRUNCATE TABLE Dim_Specialite;

INSERT INTO Dim_Specialite (SpecialiteID, Nom, Description)
SELECT SpecialiteID, Nom, Description
FROM DME_SourceDB.dbo.Specialites;

PRINT CONCAT('  -> Dim_Specialite : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.3 Dim_Diagnostic
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.3 : Peuplement de Dim_Diagnostic ---';

TRUNCATE TABLE Dim_Diagnostic;

INSERT INTO Dim_Diagnostic (DiagnosticID, CodeCIM10, Libelle, Categorie)
SELECT DiagnosticID, CodeCIM10, Libelle, Categorie
FROM DME_SourceDB.dbo.Diagnostics;

PRINT CONCAT('  -> Dim_Diagnostic : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.4 Dim_Medicament
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.4 : Peuplement de Dim_Medicament ---';

TRUNCATE TABLE Dim_Medicament;

INSERT INTO Dim_Medicament (MedicamentID, NomCommercial, NomGenerique, Classe, Forme, Dosage)
SELECT MedicamentID, NomCommercial, NomGenerique, Classe, Forme, Dosage
FROM DME_SourceDB.dbo.Medicaments;

PRINT CONCAT('  -> Dim_Medicament : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.5 Dim_TypeAnalyse
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.5 : Peuplement de Dim_TypeAnalyse ---';

TRUNCATE TABLE Dim_TypeAnalyse;

INSERT INTO Dim_TypeAnalyse (TypeAnalyseID, Nom, Unite)
SELECT TypeAnalyseID, Nom, Unite
FROM DME_SourceDB.dbo.TypesAnalyse;

PRINT CONCAT('  -> Dim_TypeAnalyse : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.6 Dim_Hopital
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.6 : Peuplement de Dim_Hopital ---';

TRUNCATE TABLE Dim_Hopital;

INSERT INTO Dim_Hopital (HopitalID, Nom, Type, Ville, Gouvernorat)
SELECT
    h.HopitalID,
    h.Nom,
    h.Type,
    v.Nom       AS Ville,
    g.Nom       AS Gouvernorat
FROM DME_SourceDB.dbo.Hopitaux        h
JOIN DME_SourceDB.dbo.Villes          v ON h.VilleID        = v.VilleID
JOIN DME_SourceDB.dbo.Gouvernorats    g ON v.GouvernoratID  = g.GouvernoratID;

PRINT CONCAT('  -> Dim_Hopital : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.7 Dim_Patient (avec calcul d'âge et groupe d'âge)
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.7 : Peuplement de Dim_Patient ---';

TRUNCATE TABLE Dim_Patient;

-- CTE pour calculer l'âge exact une seule fois et le réutiliser dans GroupeAge
WITH PatientAge AS (
    SELECT
        p.PatientID,
        p.Sexe,
        p.DateNaissance,
        p.VilleID,
        p.GroupeSanguin,
        p.Assurance,
        -- Calcul de l'âge en années complètes (une seule fois)
        AgeCalc = DATEDIFF(YEAR, p.DateNaissance, GETDATE())
            - CASE WHEN MONTH(p.DateNaissance) > MONTH(GETDATE())
                   OR (MONTH(p.DateNaissance) = MONTH(GETDATE()) AND DAY(p.DateNaissance) > DAY(GETDATE()))
                   THEN 1 ELSE 0 END
    FROM DME_SourceDB.dbo.Patients p
)
INSERT INTO Dim_Patient (PatientID, Nom, Prenom, Sexe, DateNaissance, Age, GroupeAge, Ville, Gouvernorat, GroupeSanguin, Assurance, Statut)
SELECT
    u.UtilisateurID     AS PatientID,
    u.Nom,
    u.Prenom,
    pa.Sexe,
    pa.DateNaissance,
    pa.AgeCalc          AS Age,
    -- Classification par groupe d'âge (utilise la valeur déjà calculée)
    GroupeAge = CASE
        WHEN pa.AgeCalc <= 17 THEN N'0-17'
        WHEN pa.AgeCalc <= 35 THEN N'18-35'
        WHEN pa.AgeCalc <= 55 THEN N'36-55'
        WHEN pa.AgeCalc <= 75 THEN N'56-75'
        ELSE N'75+'
    END,
    v.Nom               AS Ville,
    g.Nom               AS Gouvernorat,
    pa.GroupeSanguin,
    pa.Assurance,
    u.Statut
FROM PatientAge                              pa
JOIN DME_SourceDB.dbo.Utilisateurs           u  ON pa.PatientID     = u.UtilisateurID
LEFT JOIN DME_SourceDB.dbo.Villes            v  ON pa.VilleID       = v.VilleID
LEFT JOIN DME_SourceDB.dbo.Gouvernorats      g  ON v.GouvernoratID  = g.GouvernoratID;

PRINT CONCAT('  -> Dim_Patient : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 2.8 Dim_Medecin (avec niveau d'expérience)
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 2.8 : Peuplement de Dim_Medecin ---';

TRUNCATE TABLE Dim_Medecin;

INSERT INTO Dim_Medecin (MedecinID, Nom, Prenom, Specialite, Hopital, Ville, Gouvernorat, AnneesExperience, NiveauExperience)
SELECT
    u.UtilisateurID     AS MedecinID,
    u.Nom,
    u.Prenom,
    s.Nom               AS Specialite,
    h.Nom               AS Hopital,
    v.Nom               AS Ville,
    g.Nom               AS Gouvernorat,
    m.AnneesExperience,
    -- Classification niveau d'expérience
    NiveauExperience = CASE
        WHEN m.AnneesExperience <= 5  THEN N'Junior'
        WHEN m.AnneesExperience <= 14 THEN N'Senior'
        ELSE N'Expert'
    END
FROM DME_SourceDB.dbo.Medecins        m
JOIN DME_SourceDB.dbo.Utilisateurs    u ON m.MedecinID      = u.UtilisateurID
LEFT JOIN DME_SourceDB.dbo.Specialites s ON m.SpecialiteID  = s.SpecialiteID
LEFT JOIN DME_SourceDB.dbo.Hopitaux   h ON m.HopitalID      = h.HopitalID
LEFT JOIN DME_SourceDB.dbo.Villes     v ON h.VilleID        = v.VilleID
LEFT JOIN DME_SourceDB.dbo.Gouvernorats g ON v.GouvernoratID = g.GouvernoratID;

PRINT CONCAT('  -> Dim_Medecin : ', @@ROWCOUNT, ' lignes insérées');
GO

-- ============================================================
-- ÉTAPE 3 : PEUPLER LES TABLES DE FAITS
-- ============================================================

-- -------------------------------------------------------
-- 3.1 Fact_Consultation
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 3.1 : Peuplement de Fact_Consultation ---';

TRUNCATE TABLE Fact_Consultation;

INSERT INTO Fact_Consultation (
    DateKey, PatientKey, MedecinKey, DiagnosticKey, HopitalKey,
    ConsultationID, TypeConsultation, DureeMinutes,
    NombreOrdonnances, NombreAnalyses, EstUrgence
)
SELECT
    -- Clé de date (format YYYYMMDD)
    DateKey          = YEAR(c.DateConsultation) * 10000 + MONTH(c.DateConsultation) * 100 + DAY(c.DateConsultation),
    PatientKey       = dp.PatientKey,
    MedecinKey       = dm.MedecinKey,
    DiagnosticKey    = dd.DiagnosticKey,
    HopitalKey       = dh.HopitalKey,
    ConsultationID   = c.ConsultationID,
    TypeConsultation = c.TypeConsultation,
    DureeMinutes     = c.DureeMinutes,
    -- Comptage des ordonnances liées
    NombreOrdonnances = (
        SELECT COUNT(*) FROM DME_SourceDB.dbo.Ordonnances o
        WHERE o.ConsultationID = c.ConsultationID
    ),
    -- Comptage des demandes d'analyse du patient le jour même
    NombreAnalyses = (
        SELECT COUNT(*) FROM DME_SourceDB.dbo.DemandesAnalyse da
        WHERE da.PatientID = c.PatientID
          AND da.DateDemande = CAST(c.DateConsultation AS DATE)
    ),
    EstUrgence = CASE WHEN c.TypeConsultation = N'Urgence' THEN 1 ELSE 0 END
FROM DME_SourceDB.dbo.Consultations   c
JOIN Dim_Patient   dp ON c.PatientID    = dp.PatientID
JOIN Dim_Medecin   dm ON c.MedecinID   = dm.MedecinID
JOIN Dim_Diagnostic dd ON c.DiagnosticID = dd.DiagnosticID
JOIN Dim_Hopital    dh ON c.HopitalID   = dh.HopitalID
WHERE c.DiagnosticID IS NOT NULL
  AND c.HopitalID    IS NOT NULL;

PRINT CONCAT('  -> Fact_Consultation : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 3.2 Fact_Ordonnance
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 3.2 : Peuplement de Fact_Ordonnance ---';

TRUNCATE TABLE Fact_Ordonnance;

INSERT INTO Fact_Ordonnance (
    DateKey, PatientKey, MedecinKey, MedicamentKey, ConsultationKey,
    OrdonnanceID, DureeTrtJours
)
SELECT
    DateKey        = YEAR(o.DatePrescription) * 10000 + MONTH(o.DatePrescription) * 100 + DAY(o.DatePrescription),
    PatientKey     = dp.PatientKey,
    MedecinKey     = dm.MedecinKey,
    MedicamentKey  = dmed.MedicamentKey,
    ConsultationKey = fc.ConsultationKey,
    OrdonnanceID   = o.OrdonnanceID,
    -- Extraction précise du nombre de jours depuis le champ DureeTrt (format "N jours")
    -- TRY_CAST sur la partie numérique extraite avant le mot "jour"
    DureeTrtJours  = TRY_CAST(
        LTRIM(RTRIM(
            LEFT(o.DureeTrt, CHARINDEX(N'jour', LOWER(o.DureeTrt)) - 1)
        )) AS INT
    )
FROM DME_SourceDB.dbo.Ordonnances     o
JOIN Dim_Patient      dp   ON o.PatientID     = dp.PatientID
JOIN Dim_Medecin      dm   ON o.MedecinID     = dm.MedecinID
JOIN Dim_Medicament   dmed ON o.MedicamentID  = dmed.MedicamentID
JOIN Fact_Consultation fc  ON o.ConsultationID = fc.ConsultationID;

PRINT CONCAT('  -> Fact_Ordonnance : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 3.3 Fact_Analyse
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 3.3 : Peuplement de Fact_Analyse ---';

TRUNCATE TABLE Fact_Analyse;

INSERT INTO Fact_Analyse (
    DateDemandeKey, DateResultatKey, PatientKey, MedecinKey,
    TypeAnalyseKey, HopitalKey, DemandeID, Valeur,
    EstAnormal, EstUrgent, DelaiResultatJours
)
SELECT
    DateDemandeKey   = YEAR(da.DateDemande)   * 10000 + MONTH(da.DateDemande)   * 100 + DAY(da.DateDemande),
    DateResultatKey  = CASE WHEN ra.DateResultat IS NOT NULL
                       THEN YEAR(ra.DateResultat) * 10000 + MONTH(ra.DateResultat) * 100 + DAY(ra.DateResultat)
                       ELSE NULL END,
    PatientKey       = dp.PatientKey,
    MedecinKey       = dm.MedecinKey,
    TypeAnalyseKey   = dta.TypeAnalyseKey,
    -- Hôpital via le médecin (sinon hôpital par défaut)
    HopitalKey       = ISNULL(
                           (SELECT TOP 1 dh.HopitalKey
                            FROM DME_SourceDB.dbo.Medecins src_m
                            JOIN Dim_Hopital dh ON src_m.HopitalID = dh.HopitalID
                            WHERE src_m.MedecinID = da.MedecinID),
                           1
                       ),
    DemandeID        = da.DemandeID,
    Valeur           = ra.Valeur,
    EstAnormal       = ISNULL(ra.Anormal, 0),
    EstUrgent        = da.Urgence,
    -- Calcul du délai de résultat en jours
    DelaiResultatJours = CASE WHEN ra.DateResultat IS NOT NULL
                         THEN DATEDIFF(DAY, da.DateDemande, ra.DateResultat)
                         ELSE NULL END
FROM DME_SourceDB.dbo.DemandesAnalyse da
JOIN Dim_Patient     dp  ON da.PatientID     = dp.PatientID
JOIN Dim_Medecin     dm  ON da.MedecinID     = dm.MedecinID
JOIN Dim_TypeAnalyse dta ON da.TypeAnalyseID = dta.TypeAnalyseID
LEFT JOIN DME_SourceDB.dbo.ResultatsAnalyse ra ON da.DemandeID = ra.DemandeID;

PRINT CONCAT('  -> Fact_Analyse : ', @@ROWCOUNT, ' lignes insérées');
GO

-- -------------------------------------------------------
-- 3.4 Fact_Hospitalisation
-- -------------------------------------------------------
PRINT '';
PRINT '--- ÉTAPE 3.4 : Peuplement de Fact_Hospitalisation ---';

TRUNCATE TABLE Fact_Hospitalisation;

INSERT INTO Fact_Hospitalisation (
    DateEntreeKey, DateSortieKey, PatientKey, MedecinKey,
    DiagnosticKey, HopitalKey, HospitalisationID,
    DureeSejourJours, CoutSejour, Service
)
SELECT
    DateEntreeKey    = YEAR(h.DateEntree)  * 10000 + MONTH(h.DateEntree)  * 100 + DAY(h.DateEntree),
    DateSortieKey    = CASE WHEN h.DateSortie IS NOT NULL
                       THEN YEAR(h.DateSortie) * 10000 + MONTH(h.DateSortie) * 100 + DAY(h.DateSortie)
                       ELSE NULL END,
    PatientKey       = dp.PatientKey,
    MedecinKey       = dm.MedecinKey,
    DiagnosticKey    = dd.DiagnosticKey,
    HopitalKey       = dh.HopitalKey,
    HospitalisationID = h.HospitalisationID,
    -- Calcul de la durée du séjour en jours
    DureeSejourJours = CASE WHEN h.DateSortie IS NOT NULL
                       THEN DATEDIFF(DAY, h.DateEntree, h.DateSortie)
                       ELSE NULL END,
    CoutSejour       = h.CoutSejour,
    Service          = h.Service
FROM DME_SourceDB.dbo.Hospitalisations h
JOIN Dim_Patient    dp ON h.PatientID    = dp.PatientID
JOIN Dim_Medecin    dm ON h.MedecinID   = dm.MedecinID
JOIN Dim_Diagnostic dd ON h.DiagnosticID = dd.DiagnosticID
JOIN Dim_Hopital    dh ON h.HopitalID   = dh.HopitalID
WHERE h.DiagnosticID IS NOT NULL;

PRINT CONCAT('  -> Fact_Hospitalisation : ', @@ROWCOUNT, ' lignes insérées');
GO

-- ============================================================
-- ÉTAPE 4 : STATISTIQUES FINALES DU DATA WAREHOUSE
-- ============================================================
PRINT '';
PRINT '==================================================';
PRINT 'STATISTIQUES FINALES DU DATA WAREHOUSE';
PRINT '==================================================';

SELECT
    TableName = 'Dim_Date',
    NombreLignes = COUNT(*)
FROM Dim_Date
UNION ALL
SELECT 'Dim_Patient',        COUNT(*) FROM Dim_Patient
UNION ALL
SELECT 'Dim_Medecin',        COUNT(*) FROM Dim_Medecin
UNION ALL
SELECT 'Dim_Specialite',     COUNT(*) FROM Dim_Specialite
UNION ALL
SELECT 'Dim_Diagnostic',     COUNT(*) FROM Dim_Diagnostic
UNION ALL
SELECT 'Dim_Medicament',     COUNT(*) FROM Dim_Medicament
UNION ALL
SELECT 'Dim_TypeAnalyse',    COUNT(*) FROM Dim_TypeAnalyse
UNION ALL
SELECT 'Dim_Hopital',        COUNT(*) FROM Dim_Hopital
UNION ALL
SELECT 'Dim_Gouvernorat',    COUNT(*) FROM Dim_Gouvernorat
UNION ALL
SELECT 'Fact_Consultation',  COUNT(*) FROM Fact_Consultation
UNION ALL
SELECT 'Fact_Ordonnance',    COUNT(*) FROM Fact_Ordonnance
UNION ALL
SELECT 'Fact_Analyse',       COUNT(*) FROM Fact_Analyse
UNION ALL
SELECT 'Fact_Hospitalisation',COUNT(*) FROM Fact_Hospitalisation
ORDER BY TableName;
GO

-- ============================================================
-- REQUÊTES DE VALIDATION (vérifications post-ETL)
-- ============================================================
PRINT '';
PRINT '--- Validation : Consultations par année ---';
SELECT
    dd.Annee,
    NombreConsultations = COUNT(*)
FROM Fact_Consultation fc
JOIN Dim_Date dd ON fc.DateKey = dd.DateKey
GROUP BY dd.Annee
ORDER BY dd.Annee;

PRINT '';
PRINT '--- Validation : Top 5 diagnostics ---';
SELECT TOP 5
    diag.Libelle,
    NombreConsultations = COUNT(*)
FROM Fact_Consultation fc
JOIN Dim_Diagnostic diag ON fc.DiagnosticKey = diag.DiagnosticKey
GROUP BY diag.Libelle
ORDER BY NombreConsultations DESC;

PRINT '';
PRINT '--- Validation : Taux d''analyses anormales par type ---';
SELECT
    ta.Nom          AS TypeAnalyse,
    TotalAnalyses   = COUNT(*),
    AnalysesAnormales = SUM(CAST(fa.EstAnormal AS INT)),
    TauxAnormal     = CAST(SUM(CAST(fa.EstAnormal AS INT)) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,1))
FROM Fact_Analyse fa
JOIN Dim_TypeAnalyse ta ON fa.TypeAnalyseKey = ta.TypeAnalyseKey
GROUP BY ta.Nom
ORDER BY TauxAnormal DESC;

PRINT '';
PRINT '--- Validation : Durée moyenne d''hospitalisation par spécialité ---';
SELECT
    dm.Specialite,
    NombreHospitalisations = COUNT(*),
    DureeMoyenneJours = CAST(AVG(CAST(fh.DureeSejourJours AS FLOAT)) AS DECIMAL(5,1)),
    CoutMoyen = CAST(AVG(fh.CoutSejour) AS DECIMAL(10,2))
FROM Fact_Hospitalisation fh
JOIN Dim_Medecin dm ON fh.MedecinKey = dm.MedecinKey
WHERE fh.DureeSejourJours IS NOT NULL
GROUP BY dm.Specialite
ORDER BY DureeMoyenneJours DESC;

PRINT '';
PRINT '==================================================';
PRINT 'ETL TERMINÉ AVEC SUCCÈS';
PRINT CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '==================================================';
GO
