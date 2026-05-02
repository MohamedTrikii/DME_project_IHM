-- ============================================================
-- Fichier      : 04_SCD_Merge_Scripts.sql
-- Description  : Scripts T-SQL pour Slowly Changing Dimensions
--                Type 1 (écrasement) et Type 2 (historisation)
-- Projet       : DME_BI - Architecture SSIS Professionnelle
-- Cours        : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================
-- SCD Type 1 : Mise à jour simple (écrasement de l'ancienne valeur)
--              → Utilisé pour : corrections d'erreurs de saisie,
--                clés étrangères, codes de référence
--              → Tables : Dim_Gouvernorat, Dim_Specialite,
--                         Dim_Diagnostic, Dim_Medicament,
--                         Dim_Hopital, Dim_TypeAnalyse
--
-- SCD Type 2 : Historisation des changements (nouvelle ligne)
--              → Utilisé pour : suivre l'évolution dans le temps
--              → Tables : Dim_Patient, Dim_Medecin
--              → Colonnes ajoutées : DateDebutValidite, DateFinValidite,
--                EstCourant (flag)
-- ============================================================

USE DME_DataWarehouse;
GO

-- ============================================================
-- PRÉPARATION : Ajouter colonnes SCD Type 2 sur Dim_Patient
-- ============================================================
-- Ces colonnes sont nécessaires pour gérer l'historique Type 2.
-- À exécuter UNE SEULE FOIS après la création initiale du DW.

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE  object_id = OBJECT_ID('dbo.Dim_Patient')
      AND  name = 'DateDebutValidite'
)
BEGIN
    ALTER TABLE dbo.Dim_Patient
        ADD DateDebutValidite   DATE         NOT NULL DEFAULT '2020-01-01',
            DateFinValidite     DATE         NULL,
            EstCourant          BIT          NOT NULL DEFAULT 1,
            HashRecord          NVARCHAR(64) NULL;   -- SHA-256 pour détecter les changements
    PRINT N'Colonnes SCD Type 2 ajoutées à Dim_Patient';
END
GO

-- SCD Type 2 sur Dim_Medecin
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE  object_id = OBJECT_ID('dbo.Dim_Medecin')
      AND  name = 'DateDebutValidite'
)
BEGIN
    ALTER TABLE dbo.Dim_Medecin
        ADD DateDebutValidite   DATE         NOT NULL DEFAULT '2020-01-01',
            DateFinValidite     DATE         NULL,
            EstCourant          BIT          NOT NULL DEFAULT 1,
            HashRecord          NVARCHAR(64) NULL;
    PRINT N'Colonnes SCD Type 2 ajoutées à Dim_Medecin';
END
GO

-- ============================================================
-- SCRIPT SCD TYPE 1 — Dim_Gouvernorat
-- ============================================================
-- Effectue un MERGE entre le Staging et le DW.
-- • INSERT  : nouvelles lignes sources absentes du DW
-- • UPDATE  : lignes existantes dont les attributs ont changé

MERGE INTO dbo.Dim_Gouvernorat AS cible
USING (
    SELECT
        g.GouvernoratID,
        g.Nom,
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
    FROM DME_Staging.stg.Gouvernorat g
) AS source
ON  cible.GouvernoratID = source.GouvernoratID

-- SCD1 : mise à jour si le nom ou la région ont changé
WHEN MATCHED AND (
    cible.Nom    <> source.Nom OR
    cible.Region <> source.Region
) THEN UPDATE SET
    cible.Nom    = source.Nom,
    cible.Region = source.Region

-- INSERT si gouvernorat inconnu
WHEN NOT MATCHED BY TARGET THEN
    INSERT (GouvernoratID, Nom, Region)
    VALUES (source.GouvernoratID, source.Nom, source.Region);
GO

-- ============================================================
-- SCRIPT SCD TYPE 1 — Dim_Hopital
-- ============================================================
MERGE INTO dbo.Dim_Hopital AS cible
USING (
    SELECT
        h.HopitalID,
        h.Nom,
        h.Type,
        v.Nom   AS Ville,
        g.Nom   AS Gouvernorat
    FROM DME_Staging.stg.Hopital           h
    JOIN DME_SourceDB.dbo.Villes           v ON h.VilleID       = v.VilleID
    JOIN DME_SourceDB.dbo.Gouvernorats     g ON v.GouvernoratID = g.GouvernoratID
) AS source
ON  cible.HopitalID = source.HopitalID

WHEN MATCHED AND (
    cible.Nom        <> source.Nom  OR
    cible.Type       <> source.Type OR
    ISNULL(cible.Ville, '')       <> ISNULL(source.Ville, '')  OR
    ISNULL(cible.Gouvernorat, '') <> ISNULL(source.Gouvernorat, '')
) THEN UPDATE SET
    cible.Nom        = source.Nom,
    cible.Type       = source.Type,
    cible.Ville      = source.Ville,
    cible.Gouvernorat = source.Gouvernorat

WHEN NOT MATCHED BY TARGET THEN
    INSERT (HopitalID, Nom, Type, Ville, Gouvernorat)
    VALUES (source.HopitalID, source.Nom, source.Type, source.Ville, source.Gouvernorat);
GO

-- ============================================================
-- SCRIPT SCD TYPE 2 — Dim_Patient
-- ============================================================
-- Logique :
--   1. Calculer un hash des colonnes surveillées pour chaque patient en staging
--   2. Si le hash est différent → créer une nouvelle version (INSERT)
--      et marquer l'ancienne comme expirée (UPDATE DateFinValidite)
--   3. Si le hash est identique → ne rien faire
--   4. Si le patient est nouveau → INSERT avec EstCourant = 1
--
-- Colonnes surveillées (changements historisés) :
--   Ville, Gouvernorat, GroupeSanguin, Assurance, Statut
-- ============================================================

DECLARE @DateAujourdhui DATE = CAST(GETDATE() AS DATE);

-- -------------------------------------------------------
-- ÉTAPE A : Calculer les hashs des données staging
-- -------------------------------------------------------
WITH StgPatient_Hash AS (
    SELECT
        p.PatientID,
        u.Nom,
        u.Prenom,
        p.Sexe,
        p.DateNaissance,
        AgeCalc = DATEDIFF(YEAR, p.DateNaissance, GETDATE())
            - CASE WHEN MONTH(p.DateNaissance) > MONTH(GETDATE())
                   OR (MONTH(p.DateNaissance) = MONTH(GETDATE()) AND DAY(p.DateNaissance) > DAY(GETDATE()))
                   THEN 1 ELSE 0 END,
        v.Nom   AS Ville,
        g.Nom   AS Gouvernorat,
        p.GroupeSanguin,
        p.Assurance,
        u.Statut,
        -- Hash SHA-256 des colonnes SCD2
        HashVal = CONVERT(NVARCHAR(64),
            HASHBYTES('SHA2_256',
                CONCAT_WS('|',
                    ISNULL(v.Nom,  ''),
                    ISNULL(g.Nom,  ''),
                    ISNULL(p.GroupeSanguin, ''),
                    ISNULL(p.Assurance, ''),
                    ISNULL(u.Statut, '')
                )
            ), 2)
    FROM DME_Staging.stg.Patient   p
    JOIN DME_SourceDB.dbo.Utilisateurs u ON p.PatientID     = u.UtilisateurID
    LEFT JOIN DME_SourceDB.dbo.Villes  v ON p.VilleID       = v.VilleID
    LEFT JOIN DME_SourceDB.dbo.Gouvernorats g ON v.GouvernoratID = g.GouvernoratID
),

-- -------------------------------------------------------
-- ÉTAPE B : Comparer avec la version courante dans le DW
-- -------------------------------------------------------
PatientChanges AS (
    SELECT
        s.*,
        d.PatientKey    AS OldPatientKey,
        d.HashRecord    AS OldHash,
        ChangeType      = CASE
            WHEN d.PatientKey IS NULL THEN 'INSERT'    -- Nouveau patient
            WHEN d.HashRecord <> s.HashVal THEN 'SCD2' -- Attribut changé
            ELSE 'NOCHANGE'
        END
    FROM StgPatient_Hash s
    LEFT JOIN dbo.Dim_Patient d ON s.PatientID = d.PatientID AND d.EstCourant = 1
)

-- -------------------------------------------------------
-- ÉTAPE C-1 : Expirer les anciennes versions (SCD2 uniquement)
-- -------------------------------------------------------
UPDATE dbo.Dim_Patient
SET    DateFinValidite = DATEADD(DAY, -1, @DateAujourdhui),
       EstCourant      = 0
FROM   dbo.Dim_Patient dp
JOIN   PatientChanges  pc ON dp.PatientKey = pc.OldPatientKey
WHERE  pc.ChangeType = 'SCD2';

-- -------------------------------------------------------
-- ÉTAPE C-2 : Insérer les nouvelles versions (INSERT + SCD2)
-- -------------------------------------------------------
INSERT INTO dbo.Dim_Patient (
    PatientID, Nom, Prenom, Sexe, DateNaissance, Age, GroupeAge,
    Ville, Gouvernorat, GroupeSanguin, Assurance, Statut,
    DateDebutValidite, DateFinValidite, EstCourant, HashRecord
)
SELECT
    pc.PatientID,
    pc.Nom,
    pc.Prenom,
    pc.Sexe,
    pc.DateNaissance,
    pc.AgeCalc,
    GroupeAge = CASE
        WHEN pc.AgeCalc <= 17 THEN N'0-17'
        WHEN pc.AgeCalc <= 35 THEN N'18-35'
        WHEN pc.AgeCalc <= 55 THEN N'36-55'
        WHEN pc.AgeCalc <= 75 THEN N'56-75'
        ELSE N'75+'
    END,
    pc.Ville,
    pc.Gouvernorat,
    pc.GroupeSanguin,
    pc.Assurance,
    pc.Statut,
    @DateAujourdhui,  -- DateDebutValidite
    NULL,             -- DateFinValidite (courant)
    1,                -- EstCourant
    pc.HashVal
FROM (
    -- Re-calculer avec ChangeType (inline pour éviter double CTE)
    SELECT s.*,
        ChangeType = CASE
            WHEN d.PatientKey IS NULL THEN 'INSERT'
            WHEN d.HashRecord <> s.HashVal THEN 'SCD2'
            ELSE 'NOCHANGE'
        END
    FROM (
        SELECT
            p.PatientID,
            u.Nom,
            u.Prenom,
            p.Sexe,
            p.DateNaissance,
            AgeCalc = DATEDIFF(YEAR, p.DateNaissance, GETDATE())
                - CASE WHEN MONTH(p.DateNaissance) > MONTH(GETDATE())
                       OR (MONTH(p.DateNaissance) = MONTH(GETDATE()) AND DAY(p.DateNaissance) > DAY(GETDATE()))
                       THEN 1 ELSE 0 END,
            v.Nom   AS Ville,
            g.Nom   AS Gouvernorat,
            p.GroupeSanguin,
            p.Assurance,
            u.Statut,
            HashVal = CONVERT(NVARCHAR(64),
                HASHBYTES('SHA2_256',
                    CONCAT_WS('|',
                        ISNULL(v.Nom,  ''),
                        ISNULL(g.Nom,  ''),
                        ISNULL(p.GroupeSanguin, ''),
                        ISNULL(p.Assurance, ''),
                        ISNULL(u.Statut, '')
                    )
                ), 2)
        FROM DME_Staging.stg.Patient   p
        JOIN DME_SourceDB.dbo.Utilisateurs u ON p.PatientID = u.UtilisateurID
        LEFT JOIN DME_SourceDB.dbo.Villes  v ON p.VilleID = v.VilleID
        LEFT JOIN DME_SourceDB.dbo.Gouvernorats g ON v.GouvernoratID = g.GouvernoratID
    ) s
    LEFT JOIN dbo.Dim_Patient d ON s.PatientID = d.PatientID AND d.EstCourant = 1
) pc
WHERE pc.ChangeType IN ('INSERT', 'SCD2');

PRINT CONCAT(N'SCD2 Dim_Patient appliqué — ', @@ROWCOUNT, N' ligne(s) insérée(s)/mises à jour');
GO

-- ============================================================
-- SCRIPT SCD TYPE 2 — Dim_Medecin
-- ============================================================
-- Colonnes surveillées : Specialite, Hopital, AnneesExperience, NiveauExperience

DECLARE @DateAujourdhui DATE = CAST(GETDATE() AS DATE);

-- Expirer les versions obsolètes
UPDATE dbo.Dim_Medecin
SET    DateFinValidite = DATEADD(DAY, -1, @DateAujourdhui),
       EstCourant      = 0
FROM   dbo.Dim_Medecin dm
JOIN (
    SELECT
        src.MedecinID,
        HashVal = CONVERT(NVARCHAR(64),
            HASHBYTES('SHA2_256',
                CONCAT_WS('|',
                    ISNULL(s.Nom,  ''),
                    ISNULL(h.Nom,  ''),
                    ISNULL(CAST(src.AnneesExperience AS NVARCHAR), '')
                )
            ), 2)
    FROM DME_Staging.stg.Medecin    src
    LEFT JOIN DME_SourceDB.dbo.Specialites s ON src.SpecialiteID = s.SpecialiteID
    LEFT JOIN DME_SourceDB.dbo.Hopitaux    h ON src.HopitalID    = h.HopitalID
) src ON dm.MedecinID = src.MedecinID
       AND dm.EstCourant = 1
       AND dm.HashRecord <> src.HashVal;

-- Insérer les nouvelles versions
INSERT INTO dbo.Dim_Medecin (
    MedecinID, Nom, Prenom, Specialite, Hopital, Ville, Gouvernorat,
    AnneesExperience, NiveauExperience,
    DateDebutValidite, DateFinValidite, EstCourant, HashRecord
)
SELECT
    u.UtilisateurID,
    u.Nom,
    u.Prenom,
    s.Nom       AS Specialite,
    h.Nom       AS Hopital,
    v.Nom       AS Ville,
    g.Nom       AS Gouvernorat,
    m.AnneesExperience,
    NiveauExperience = CASE
        WHEN m.AnneesExperience <= 5  THEN N'Junior'
        WHEN m.AnneesExperience <= 14 THEN N'Senior'
        ELSE N'Expert'
    END,
    @DateAujourdhui,
    NULL,
    1,
    CONVERT(NVARCHAR(64),
        HASHBYTES('SHA2_256',
            CONCAT_WS('|',
                ISNULL(s.Nom, ''),
                ISNULL(h.Nom, ''),
                ISNULL(CAST(m.AnneesExperience AS NVARCHAR), '')
            )
        ), 2)
FROM DME_Staging.stg.Medecin       m
JOIN DME_SourceDB.dbo.Utilisateurs u ON m.MedecinID     = u.UtilisateurID
LEFT JOIN DME_SourceDB.dbo.Specialites s ON m.SpecialiteID = s.SpecialiteID
LEFT JOIN DME_SourceDB.dbo.Hopitaux    h ON m.HopitalID    = h.HopitalID
LEFT JOIN DME_SourceDB.dbo.Villes      v ON h.VilleID      = v.VilleID
LEFT JOIN DME_SourceDB.dbo.Gouvernorats g ON v.GouvernoratID = g.GouvernoratID
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Dim_Medecin dm
    WHERE  dm.MedecinID  = m.MedecinID
      AND  dm.EstCourant = 1
      AND  dm.HashRecord = CONVERT(NVARCHAR(64),
               HASHBYTES('SHA2_256',
                   CONCAT_WS('|',
                       ISNULL(s.Nom, ''),
                       ISNULL(h.Nom, ''),
                       ISNULL(CAST(m.AnneesExperience AS NVARCHAR), '')
                   )
               ), 2)
);

PRINT CONCAT(N'SCD2 Dim_Medecin appliqué — ', @@ROWCOUNT, N' ligne(s) insérée(s)/mises à jour');
GO

-- ============================================================
-- REQUÊTES DE CONTRÔLE — Vérifier les versions SCD2
-- ============================================================

-- Patients ayant plusieurs versions (historique SCD2)
SELECT
    PatientID,
    Nom,
    Prenom,
    NombreVersions = COUNT(*),
    VersionCourante = MAX(CASE WHEN EstCourant = 1 THEN DateDebutValidite END),
    VersionOriginale = MIN(DateDebutValidite)
FROM dbo.Dim_Patient
GROUP BY PatientID, Nom, Prenom
HAVING COUNT(*) > 1
ORDER BY NombreVersions DESC;

-- Médecins avec historique
SELECT
    MedecinID,
    Nom,
    Prenom,
    NombreVersions = COUNT(*),
    VersionCourante = MAX(CASE WHEN EstCourant = 1 THEN DateDebutValidite END)
FROM dbo.Dim_Medecin
GROUP BY MedecinID, Nom, Prenom
HAVING COUNT(*) > 1
ORDER BY MedecinID;
GO
