-- ============================================================
-- Fichier      : 03_Create_Config_Tables.sql
-- Description  : Tables de configuration et métadonnées ETL
--                Paramètres centralisés, mapping, audit colonnes
-- Projet       : DME_BI - Architecture SSIS Professionnelle
-- Cours        : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================
-- Tables créées dans DME_Staging sous le schéma [cfg] :
--   cfg.Parametre         → Paramètres clé/valeur du pipeline ETL
--   cfg.TableMapping      → Mapping source → cible avec métadonnées
--   cfg.ColonneMapping    → Mapping colonne par colonne
--   cfg.PlanningETL       → Planification des runs (horaires, fréquence)
-- ============================================================

USE DME_Staging;
GO

CREATE SCHEMA [cfg];
GO

-- ============================================================
-- cfg.Parametre — Paramètres globaux du pipeline ETL
-- ============================================================
CREATE TABLE [cfg].Parametre (
    ParametreID         INT             IDENTITY(1,1) NOT NULL,
    CleParametre        NVARCHAR(100)   NOT NULL,
    Valeur              NVARCHAR(500)   NULL,
    TypeValeur          NVARCHAR(20)    NOT NULL DEFAULT N'STRING', -- STRING / INT / BOOL / DATE
    Environnement       NVARCHAR(20)    NOT NULL DEFAULT N'ALL',    -- ALL / DEV / TEST / PROD
    Description         NVARCHAR(500)   NULL,
    DateCreation        DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    DateMAJ             DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    Actif               BIT             NOT NULL DEFAULT 1,
    CONSTRAINT PK_cfg_Parametre PRIMARY KEY (ParametreID),
    CONSTRAINT UQ_cfg_Parametre_Cle UNIQUE (CleParametre, Environnement)
);
GO

-- Paramètres par défaut
INSERT INTO [cfg].Parametre (CleParametre, Valeur, TypeValeur, Environnement, Description) VALUES
-- Connexions
(N'SourceDB_Server',        N'.',                       N'STRING', N'ALL',  N'Serveur SQL de la base source DME_SourceDB'),
(N'SourceDB_Name',          N'DME_SourceDB',            N'STRING', N'ALL',  N'Nom de la base de données source OLTP'),
(N'StagingDB_Name',         N'DME_Staging',             N'STRING', N'ALL',  N'Nom de la base de données Staging'),
(N'DWH_Server',             N'.',                       N'STRING', N'ALL',  N'Serveur SQL du Data Warehouse'),
(N'DWH_Name',               N'DME_DataWarehouse',       N'STRING', N'ALL',  N'Nom du Data Warehouse'),
-- ETL
(N'ETL_TypeExecution',      N'FULL',                    N'STRING', N'ALL',  N'FULL = rechargement complet / INCR = incrémental'),
(N'ETL_BatchSize',          N'10000',                   N'INT',    N'ALL',  N'Nombre de lignes par lot SSIS'),
(N'ETL_Parallelisme',       N'4',                       N'INT',    N'ALL',  N'Degré de parallélisme des packages'),
(N'ETL_TimeoutSecondes',    N'3600',                    N'INT',    N'ALL',  N'Timeout global ETL en secondes'),
(N'ETL_RetriesMax',         N'3',                       N'INT',    N'ALL',  N'Nombre de tentatives en cas d''échec'),
-- Paths
(N'ETL_LogPath',            N'C:\DME_BI\Logs',          N'STRING', N'PROD', N'Chemin des fichiers de log ETL'),
(N'ETL_LogPath',            N'C:\Temp\DME_Logs',        N'STRING', N'DEV',  N'Chemin des fichiers de log ETL (dev)'),
(N'ETL_ErrorPath',          N'C:\DME_BI\Errors',        N'STRING', N'PROD', N'Chemin des fichiers d''erreur (lignes rejetées)'),
-- Alertes email
(N'Alerte_Email_Actif',     N'1',                       N'BOOL',   N'PROD', N'Activer les alertes email'),
(N'Alerte_Email_Destinataire', N'admin@dme-bi.tn',      N'STRING', N'PROD', N'Email destinataire des alertes'),
(N'Alerte_SeuilErreurs',    N'10',                      N'INT',    N'ALL',  N'Nombre max d''erreurs avant alerte'),
-- SCD
(N'SCD_Type2_Patient',      N'1',                       N'BOOL',   N'ALL',  N'Activer SCD Type 2 pour Dim_Patient'),
(N'SCD_Type2_Medecin',      N'1',                       N'BOOL',   N'ALL',  N'Activer SCD Type 2 pour Dim_Medecin'),
-- Dim_Date
(N'DimDate_AnneeDebut',     N'2020',                    N'INT',    N'ALL',  N'Année de début pour sp_Remplir_Dim_Date'),
(N'DimDate_AnneeFin',       N'2026',                    N'INT',    N'ALL',  N'Année de fin pour sp_Remplir_Dim_Date');
GO

-- ============================================================
-- cfg.TableMapping — Mapping source → staging → DW
-- ============================================================
CREATE TABLE [cfg].TableMapping (
    MappingID           INT             IDENTITY(1,1) NOT NULL,
    NomTableSource      NVARCHAR(150)   NOT NULL,
    SchemaSource        NVARCHAR(50)    NOT NULL DEFAULT N'dbo',
    NomTableStaging     NVARCHAR(150)   NULL,
    SchemaStaging       NVARCHAR(50)    NULL DEFAULT N'stg',
    NomTableCible       NVARCHAR(150)   NOT NULL,
    SchemaCible         NVARCHAR(50)    NOT NULL DEFAULT N'dbo',
    BaseCible           NVARCHAR(100)   NOT NULL DEFAULT N'DME_DataWarehouse',
    TypeChargement      NVARCHAR(20)    NOT NULL DEFAULT N'FULL',  -- FULL / INCREMENTAL / SCD1 / SCD2
    ColonneWatermark    NVARCHAR(100)   NULL,     -- Colonne de date pour chargement incrémental
    ClePrimaire         NVARCHAR(200)   NULL,     -- Clé(s) primaire(s) source
    OrdreChargement     INT             NOT NULL DEFAULT 99,
    Actif               BIT             NOT NULL DEFAULT 1,
    Description         NVARCHAR(500)   NULL,
    CONSTRAINT PK_cfg_TableMapping PRIMARY KEY (MappingID)
);
GO

INSERT INTO [cfg].TableMapping
    (NomTableSource, SchemaSource, NomTableStaging, SchemaStaging, NomTableCible, SchemaCible, TypeChargement, ColonneWatermark, ClePrimaire, OrdreChargement, Description)
VALUES
-- Dimensions de référence (FULL reload)
(N'Gouvernorats',     N'dbo', N'Gouvernorat',    N'stg', N'Dim_Gouvernorat',   N'dbo', N'FULL',        NULL,                    N'GouvernoratID',    10, N'Gouvernorats tunisiens'),
(N'Specialites',      N'dbo', N'Specialite',     N'stg', N'Dim_Specialite',    N'dbo', N'FULL',        NULL,                    N'SpecialiteID',     11, N'Spécialités médicales'),
(N'Diagnostics',      N'dbo', N'Diagnostic',     N'stg', N'Dim_Diagnostic',    N'dbo', N'FULL',        NULL,                    N'DiagnosticID',     12, N'Codes CIM-10 diagnostics'),
(N'Medicaments',      N'dbo', N'Medicament',     N'stg', N'Dim_Medicament',    N'dbo', N'FULL',        NULL,                    N'MedicamentID',     13, N'Médicaments'),
(N'TypesAnalyse',     N'dbo', N'TypeAnalyse',    N'stg', N'Dim_TypeAnalyse',   N'dbo', N'FULL',        NULL,                    N'TypeAnalyseID',    14, N'Types d''analyses biologiques'),
(N'Hopitaux',         N'dbo', N'Hopital',        N'stg', N'Dim_Hopital',       N'dbo', N'FULL',        NULL,                    N'HopitalID',        15, N'Hôpitaux tunisiens'),
-- Dimensions SCD Type 2
(N'Patients',         N'dbo', N'Patient',        N'stg', N'Dim_Patient',       N'dbo', N'SCD2',        N'DateModification',     N'PatientID',        20, N'Patients - SCD Type 2'),
(N'Medecins',         N'dbo', N'Medecin',        N'stg', N'Dim_Medecin',       N'dbo', N'SCD2',        N'DateModification',     N'MedecinID',        21, N'Médecins - SCD Type 2'),
-- Tables de faits (incrémental par watermark)
(N'Consultations',    N'dbo', N'Consultation',   N'stg', N'Fact_Consultation', N'dbo', N'INCREMENTAL', N'DateConsultation',     N'ConsultationID',   50, N'Consultations médicales'),
(N'Ordonnances',      N'dbo', N'Ordonnance',     N'stg', N'Fact_Ordonnance',   N'dbo', N'INCREMENTAL', N'DatePrescription',     N'OrdonnanceID',     51, N'Ordonnances médicales'),
(N'DemandesAnalyse',  N'dbo', N'DemandeAnalyse', N'stg', N'Fact_Analyse',      N'dbo', N'INCREMENTAL', N'DateDemande',          N'DemandeID',        52, N'Demandes d''analyses biologiques'),
(N'Hospitalisations', N'dbo', N'Hospitalisation',N'stg', N'Fact_Hospitalisation',N'dbo',N'INCREMENTAL',N'DateEntree',           N'HospitalisationID',53, N'Hospitalisations');
GO

-- ============================================================
-- cfg.PlanningETL — Planification des exécutions ETL
-- ============================================================
CREATE TABLE [cfg].PlanningETL (
    PlanningID          INT             IDENTITY(1,1) NOT NULL,
    NomJob              NVARCHAR(200)   NOT NULL,
    TypeExecution       NVARCHAR(20)    NOT NULL DEFAULT N'FULL',
    Frequence           NVARCHAR(50)    NOT NULL DEFAULT N'QUOTIDIEN', -- QUOTIDIEN / HEBDOMADAIRE / MENSUEL
    HeureExecution      TIME            NOT NULL DEFAULT '02:00:00',
    JourExecution       NVARCHAR(20)    NULL,    -- Pour hebdomadaire: LUNDI/MARDI…
    Actif               BIT             NOT NULL DEFAULT 1,
    DerniereExecution   DATETIME2       NULL,
    ProchaineExecution  AS (
        CASE Frequence
            WHEN N'QUOTIDIEN' THEN DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME2))
            ELSE NULL
        END
    ),
    Description         NVARCHAR(500)   NULL,
    CONSTRAINT PK_cfg_PlanningETL PRIMARY KEY (PlanningID)
);
GO

INSERT INTO [cfg].PlanningETL (NomJob, TypeExecution, Frequence, HeureExecution, Description) VALUES
(N'DME_ETL_Nuit_Complet',      N'FULL',        N'HEBDOMADAIRE', '01:00:00', N'Chargement complet le dimanche à 1h du matin'),
(N'DME_ETL_Quotidien_Incr',    N'INCREMENTAL', N'QUOTIDIEN',    '03:00:00', N'Chargement incrémental des faits, du lundi au samedi à 3h'),
(N'DME_ETL_Dimensions_Incr',   N'INCREMENTAL', N'QUOTIDIEN',    '02:30:00', N'Mise à jour des dimensions (SCD) chaque nuit');
GO

-- ============================================================
-- PROCÉDURE : Lire un paramètre de configuration
-- ============================================================
CREATE OR ALTER PROCEDURE [cfg].usp_GetParametre
    @CleParametre       NVARCHAR(100),
    @Environnement      NVARCHAR(20)    = N'PROD',
    @Valeur             NVARCHAR(500)   OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    -- Cherche d'abord l'environnement spécifique, puis 'ALL'
    SELECT TOP 1 @Valeur = Valeur
    FROM   [cfg].Parametre
    WHERE  CleParametre = @CleParametre
      AND  Actif        = 1
      AND  Environnement IN (@Environnement, N'ALL')
    ORDER BY CASE WHEN Environnement = @Environnement THEN 0 ELSE 1 END;
END;
GO

PRINT N'Tables de configuration ETL créées avec succès (schéma [cfg]).';
GO
