-- ============================================================
-- Fichier      : 01_Create_Staging_Tables.sql
-- Description  : Création de la base de Staging (zone tampon ETL)
--                Inspiré de l'architecture AdventureWorksDW
-- Projet       : DME_BI - Architecture SSIS Professionnelle
-- Cours        : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================
-- Rôle de la zone Staging :
--   1. Copie brute des données sources (pas de transformation)
--   2. Isolation du DW par rapport à la source OLTP
--   3. Réexécution possible en cas d'échec ETL
--   4. Détection de changements (CDC / Watermark)
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DME_Staging')
BEGIN
    ALTER DATABASE DME_Staging SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DME_Staging;
END
GO

CREATE DATABASE DME_Staging;
GO

USE DME_Staging;
GO

-- ============================================================
-- SCHÉMAS
-- ============================================================
CREATE SCHEMA stg;   -- Tables de staging brutes
GO
CREATE SCHEMA ctl;   -- Tables de contrôle ETL (watermark, config)
GO

-- ============================================================
-- TABLES DE STAGING — couche de copie brute depuis OLTP
-- ============================================================

-- -------------------------------------------------------
-- stg.Patient (copie brute de Patients + Utilisateurs)
-- -------------------------------------------------------
CREATE TABLE stg.Patient (
    -- Colonnes source OLTP
    PatientID           INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Prenom              NVARCHAR(100)   NOT NULL,
    Sexe                NCHAR(1)        NULL,
    DateNaissance       DATE            NULL,
    VilleID             INT             NULL,
    GroupeSanguin       NVARCHAR(5)     NULL,
    Assurance           NVARCHAR(50)    NULL,
    Statut              NVARCHAR(20)    NULL,
    -- Colonnes de contrôle ETL
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,       -- Identifiant du lot d'exécution
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',  -- NOUVEAU / MODIFIE / INCHANGE
    CONSTRAINT PK_stg_Patient PRIMARY KEY (PatientID)
);
GO

-- -------------------------------------------------------
-- stg.Medecin
-- -------------------------------------------------------
CREATE TABLE stg.Medecin (
    MedecinID           INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Prenom              NVARCHAR(100)   NOT NULL,
    SpecialiteID        INT             NULL,
    HopitalID           INT             NULL,
    AnneesExperience    INT             NULL,
    Statut              NVARCHAR(20)    NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',
    CONSTRAINT PK_stg_Medecin PRIMARY KEY (MedecinID)
);
GO

-- -------------------------------------------------------
-- stg.Consultation
-- -------------------------------------------------------
CREATE TABLE stg.Consultation (
    ConsultationID      INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    HopitalID           INT             NULL,
    DiagnosticID        INT             NULL,
    DateConsultation    DATETIME        NOT NULL,
    TypeConsultation    NVARCHAR(50)    NULL,
    DureeMinutes        INT             NULL,
    Notes               NVARCHAR(MAX)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',
    CONSTRAINT PK_stg_Consultation PRIMARY KEY (ConsultationID)
);
GO

-- -------------------------------------------------------
-- stg.Ordonnance
-- -------------------------------------------------------
CREATE TABLE stg.Ordonnance (
    OrdonnanceID        INT             NOT NULL,
    ConsultationID      INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    MedicamentID        INT             NOT NULL,
    DatePrescription    DATE            NOT NULL,
    DureeTrt            NVARCHAR(100)   NULL,
    Posologie           NVARCHAR(200)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',
    CONSTRAINT PK_stg_Ordonnance PRIMARY KEY (OrdonnanceID)
);
GO

-- -------------------------------------------------------
-- stg.DemandeAnalyse
-- -------------------------------------------------------
CREATE TABLE stg.DemandeAnalyse (
    DemandeID           INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    TypeAnalyseID       INT             NOT NULL,
    DateDemande         DATE            NOT NULL,
    Urgence             BIT             NOT NULL DEFAULT 0,
    Notes               NVARCHAR(MAX)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',
    CONSTRAINT PK_stg_DemandeAnalyse PRIMARY KEY (DemandeID)
);
GO

-- -------------------------------------------------------
-- stg.ResultatAnalyse
-- -------------------------------------------------------
CREATE TABLE stg.ResultatAnalyse (
    ResultatID          INT             NOT NULL,
    DemandeID           INT             NOT NULL,
    DateResultat        DATE            NULL,
    Valeur              DECIMAL(10,3)   NULL,
    Unite               NVARCHAR(50)    NULL,
    Anormal             BIT             NOT NULL DEFAULT 0,
    Commentaire         NVARCHAR(500)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',
    CONSTRAINT PK_stg_ResultatAnalyse PRIMARY KEY (ResultatID)
);
GO

-- -------------------------------------------------------
-- stg.Hospitalisation
-- -------------------------------------------------------
CREATE TABLE stg.Hospitalisation (
    HospitalisationID   INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    HopitalID           INT             NOT NULL,
    DiagnosticID        INT             NULL,
    DateEntree          DATETIME        NOT NULL,
    DateSortie          DATETIME        NULL,
    Service             NVARCHAR(100)   NULL,
    CoutSejour          DECIMAL(10,2)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    ETL_Statut          NVARCHAR(20)    NOT NULL DEFAULT N'NOUVEAU',
    CONSTRAINT PK_stg_Hospitalisation PRIMARY KEY (HospitalisationID)
);
GO

-- -------------------------------------------------------
-- stg.Gouvernorat
-- -------------------------------------------------------
CREATE TABLE stg.Gouvernorat (
    GouvernoratID       INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    CONSTRAINT PK_stg_Gouvernorat PRIMARY KEY (GouvernoratID)
);
GO

-- -------------------------------------------------------
-- stg.Hopital
-- -------------------------------------------------------
CREATE TABLE stg.Hopital (
    HopitalID           INT             NOT NULL,
    Nom                 NVARCHAR(150)   NOT NULL,
    Type                NVARCHAR(50)    NULL,
    VilleID             INT             NULL,
    Capacite            INT             NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    CONSTRAINT PK_stg_Hopital PRIMARY KEY (HopitalID)
);
GO

-- -------------------------------------------------------
-- stg.Specialite
-- -------------------------------------------------------
CREATE TABLE stg.Specialite (
    SpecialiteID        INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Description         NVARCHAR(500)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    CONSTRAINT PK_stg_Specialite PRIMARY KEY (SpecialiteID)
);
GO

-- -------------------------------------------------------
-- stg.Medicament
-- -------------------------------------------------------
CREATE TABLE stg.Medicament (
    MedicamentID        INT             NOT NULL,
    NomCommercial       NVARCHAR(150)   NOT NULL,
    NomGenerique        NVARCHAR(150)   NULL,
    Classe              NVARCHAR(100)   NULL,
    Forme               NVARCHAR(100)   NULL,
    Dosage              NVARCHAR(100)   NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    CONSTRAINT PK_stg_Medicament PRIMARY KEY (MedicamentID)
);
GO

-- -------------------------------------------------------
-- stg.TypeAnalyse
-- -------------------------------------------------------
CREATE TABLE stg.TypeAnalyse (
    TypeAnalyseID       INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Unite               NVARCHAR(50)    NULL,
    ETL_DateExtraction  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_Lot             NVARCHAR(50)    NULL,
    CONSTRAINT PK_stg_TypeAnalyse PRIMARY KEY (TypeAnalyseID)
);
GO

-- ============================================================
-- TABLE DE CONTRÔLE : Watermark (chargement incrémental)
-- ============================================================
CREATE TABLE ctl.Watermark (
    TableSource         NVARCHAR(100)   NOT NULL,   -- Nom de la table OLTP
    DerniereValeur      DATETIME2       NOT NULL DEFAULT '2000-01-01', -- Dernière date chargée
    DateMAJ             DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_ctl_Watermark PRIMARY KEY (TableSource)
);
GO

-- Valeurs initiales du watermark (date de départ du chargement incrémental)
INSERT INTO ctl.Watermark (TableSource, DerniereValeur) VALUES
    (N'Consultations',       '2022-01-01'),
    (N'Ordonnances',         '2022-01-01'),
    (N'DemandesAnalyse',     '2022-01-01'),
    (N'ResultatsAnalyse',    '2022-01-01'),
    (N'Hospitalisations',    '2022-01-01'),
    (N'Patients',            '2020-01-01'),
    (N'Medecins',            '2020-01-01');
GO

-- ============================================================
-- PROCÉDURES UTILITAIRES STAGING
-- ============================================================

-- Vider toutes les tables de staging avant une extraction complète
CREATE OR ALTER PROCEDURE stg.usp_TruncateAllStaging
AS
BEGIN
    SET NOCOUNT ON;
    TRUNCATE TABLE stg.Consultation;
    TRUNCATE TABLE stg.Ordonnance;
    TRUNCATE TABLE stg.DemandeAnalyse;
    TRUNCATE TABLE stg.ResultatAnalyse;
    TRUNCATE TABLE stg.Hospitalisation;
    TRUNCATE TABLE stg.Patient;
    TRUNCATE TABLE stg.Medecin;
    TRUNCATE TABLE stg.Gouvernorat;
    TRUNCATE TABLE stg.Hopital;
    TRUNCATE TABLE stg.Specialite;
    TRUNCATE TABLE stg.Medicament;
    TRUNCATE TABLE stg.TypeAnalyse;
    PRINT N'Staging vidé avec succès';
END;
GO

-- Obtenir le watermark d'une table
CREATE OR ALTER PROCEDURE ctl.usp_GetWatermark
    @TableSource    NVARCHAR(100),
    @Watermark      DATETIME2 OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT @Watermark = DerniereValeur
    FROM   ctl.Watermark
    WHERE  TableSource = @TableSource;

    IF @Watermark IS NULL
        SET @Watermark = '2000-01-01';
END;
GO

-- Mettre à jour le watermark après un chargement réussi
CREATE OR ALTER PROCEDURE ctl.usp_SetWatermark
    @TableSource    NVARCHAR(100),
    @NouvelleValeur DATETIME2
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE ctl.Watermark
    SET    DerniereValeur = @NouvelleValeur,
           DateMAJ        = SYSUTCDATETIME()
    WHERE  TableSource    = @TableSource;
END;
GO

PRINT N'Base DME_Staging créée avec succès (schémas stg + ctl).';
GO
