-- ============================================================
-- Fichier      : 02_Create_ETL_Log_Tables.sql
-- Description  : Tables de logs, audit et gestion des erreurs ETL
--                Inspiré des tables de log AdventureWorksDW
-- Projet       : DME_BI - Architecture SSIS Professionnelle
-- Cours        : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================
-- Tables créées dans DME_Staging sous le schéma [log] :
--   log.ETL_Run          → Une ligne par exécution complète du pipeline
--   log.ETL_PackageLog   → Une ligne par package SSIS exécuté
--   log.ETL_TaskLog      → Une ligne par tâche SSIS (Data Flow, SQL Task…)
--   log.ETL_ErrorLog     → Enregistrement des erreurs et rejets
--   log.ETL_RowCount     → Compteurs de lignes par table/étape
-- ============================================================

USE DME_Staging;
GO

CREATE SCHEMA [log];
GO

-- ============================================================
-- log.ETL_Run — Exécution globale du pipeline
-- ============================================================
-- Une ligne est créée au démarrage du Master Package.
-- Elle est mise à jour à la fin (succès ou échec).
CREATE TABLE [log].ETL_Run (
    RunID               INT             IDENTITY(1,1) NOT NULL,
    RunGUID             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    NomEnvironnement    NVARCHAR(50)    NOT NULL DEFAULT N'PROD',  -- DEV / TEST / PROD
    TypeExecution       NVARCHAR(20)    NOT NULL DEFAULT N'FULL',  -- FULL / INCREMENTAL
    DateDebut           DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    DateFin             DATETIME2       NULL,
    DureeSecondes       AS DATEDIFF(SECOND, DateDebut, ISNULL(DateFin, SYSUTCDATETIME())) PERSISTED,
    Statut              NVARCHAR(20)    NOT NULL DEFAULT N'EN_COURS',  -- EN_COURS / SUCCES / ECHEC / PARTIEL
    NombreLignesTotal   INT             NOT NULL DEFAULT 0,
    NombrePackages      INT             NOT NULL DEFAULT 0,
    NombreErreurs       INT             NOT NULL DEFAULT 0,
    NomServeur          NVARCHAR(100)   NOT NULL DEFAULT @@SERVERNAME,
    NomLogin            NVARCHAR(100)   NOT NULL DEFAULT SYSTEM_USER,
    Commentaire         NVARCHAR(500)   NULL,
    CONSTRAINT PK_log_ETL_Run PRIMARY KEY (RunID)
);
GO

-- ============================================================
-- log.ETL_PackageLog — Suivi par package SSIS
-- ============================================================
CREATE TABLE [log].ETL_PackageLog (
    PackageLogID        INT             IDENTITY(1,1) NOT NULL,
    RunID               INT             NOT NULL,
    NomPackage          NVARCHAR(200)   NOT NULL,
    PackageGUID         UNIQUEIDENTIFIER NULL,
    NiveauHierarchie    INT             NOT NULL DEFAULT 0, -- 0=Master, 1=Sous-package
    DateDebut           DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    DateFin             DATETIME2       NULL,
    DureeSecondes       AS DATEDIFF(SECOND, DateDebut, ISNULL(DateFin, SYSUTCDATETIME())) PERSISTED,
    Statut              NVARCHAR(20)    NOT NULL DEFAULT N'EN_COURS',
    NombreLignesLues    INT             NOT NULL DEFAULT 0,
    NombreLignesInsert  INT             NOT NULL DEFAULT 0,
    NombreLignesUpdate  INT             NOT NULL DEFAULT 0,
    NombreLignesIgnorees INT            NOT NULL DEFAULT 0,
    NombreLignesErreur  INT             NOT NULL DEFAULT 0,
    MessageInfo         NVARCHAR(MAX)   NULL,
    CONSTRAINT PK_log_ETL_PackageLog PRIMARY KEY (PackageLogID),
    CONSTRAINT FK_PackageLog_Run FOREIGN KEY (RunID) REFERENCES [log].ETL_Run(RunID)
);
GO

-- ============================================================
-- log.ETL_TaskLog — Suivi par tâche SSIS (Data Flow, Execute SQL…)
-- ============================================================
CREATE TABLE [log].ETL_TaskLog (
    TaskLogID           INT             IDENTITY(1,1) NOT NULL,
    PackageLogID        INT             NOT NULL,
    RunID               INT             NOT NULL,
    NomTache            NVARCHAR(200)   NOT NULL,
    TypeTache           NVARCHAR(100)   NULL,  -- DataFlow / ExecuteSQL / Script / ForEach…
    TableCible          NVARCHAR(100)   NULL,
    DateDebut           DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    DateFin             DATETIME2       NULL,
    DureeSecondes       AS DATEDIFF(SECOND, DateDebut, ISNULL(DateFin, SYSUTCDATETIME())) PERSISTED,
    Statut              NVARCHAR(20)    NOT NULL DEFAULT N'EN_COURS',
    NombreLignesLues    INT             NOT NULL DEFAULT 0,
    NombreLignesEcrites INT             NOT NULL DEFAULT 0,
    NombreLignesErreur  INT             NOT NULL DEFAULT 0,
    CONSTRAINT PK_log_ETL_TaskLog PRIMARY KEY (TaskLogID),
    CONSTRAINT FK_TaskLog_PackageLog FOREIGN KEY (PackageLogID) REFERENCES [log].ETL_PackageLog(PackageLogID)
);
GO

-- ============================================================
-- log.ETL_ErrorLog — Détail des erreurs et lignes rejetées
-- ============================================================
CREATE TABLE [log].ETL_ErrorLog (
    ErrorLogID          INT             IDENTITY(1,1) NOT NULL,
    RunID               INT             NOT NULL,
    PackageLogID        INT             NULL,
    TaskLogID           INT             NULL,
    DateErreur          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    NomPackage          NVARCHAR(200)   NULL,
    NomTache            NVARCHAR(200)   NULL,
    TableSource         NVARCHAR(100)   NULL,
    TableCible          NVARCHAR(100)   NULL,
    CleLigne            NVARCHAR(200)   NULL,      -- Identifiant de la ligne en erreur
    CodeErreur          INT             NULL,
    MessageErreur       NVARCHAR(MAX)   NULL,
    ColonneErreur       NVARCHAR(200)   NULL,
    ValeurProblematique NVARCHAR(500)   NULL,
    LigneComplete       NVARCHAR(MAX)   NULL,      -- JSON de la ligne rejetée (optionnel)
    Severite            NVARCHAR(20)    NOT NULL DEFAULT N'ERREUR',  -- AVERTISSEMENT / ERREUR / CRITIQUE
    Traite              BIT             NOT NULL DEFAULT 0,
    CONSTRAINT PK_log_ETL_ErrorLog PRIMARY KEY (ErrorLogID),
    CONSTRAINT FK_ErrorLog_Run FOREIGN KEY (RunID) REFERENCES [log].ETL_Run(RunID)
);
GO

-- ============================================================
-- log.ETL_RowCount — Compteurs de lignes consolidés par table/run
-- ============================================================
CREATE TABLE [log].ETL_RowCount (
    RowCountID          INT             IDENTITY(1,1) NOT NULL,
    RunID               INT             NOT NULL,
    NomTable            NVARCHAR(100)   NOT NULL,
    Phase               NVARCHAR(20)    NOT NULL,  -- STAGING / DIMENSION / FAIT
    TypeOperation       NVARCHAR(20)    NOT NULL,  -- INSERT / UPDATE / DELETE / MERGE
    NombreLignes        INT             NOT NULL DEFAULT 0,
    DateEnregistrement  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_log_ETL_RowCount PRIMARY KEY (RowCountID),
    CONSTRAINT FK_RowCount_Run FOREIGN KEY (RunID) REFERENCES [log].ETL_Run(RunID)
);
GO

-- ============================================================
-- PROCÉDURES STOCKÉES DE JOURNALISATION
-- ============================================================

-- Démarrer une nouvelle exécution ETL (appelé par le Master Package)
CREATE OR ALTER PROCEDURE [log].usp_StartRun
    @TypeExecution      NVARCHAR(20)    = N'FULL',
    @NomEnvironnement   NVARCHAR(50)    = N'PROD',
    @RunID              INT             OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [log].ETL_Run (TypeExecution, NomEnvironnement, Statut)
    VALUES (@TypeExecution, @NomEnvironnement, N'EN_COURS');
    SET @RunID = SCOPE_IDENTITY();
    PRINT CONCAT(N'ETL Run démarré : RunID=', @RunID);
END;
GO

-- Terminer une exécution ETL
CREATE OR ALTER PROCEDURE [log].usp_EndRun
    @RunID      INT,
    @Statut     NVARCHAR(20) = N'SUCCES',
    @Commentaire NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [log].ETL_Run
    SET    DateFin          = SYSUTCDATETIME(),
           Statut           = @Statut,
           Commentaire      = @Commentaire,
           NombreErreurs    = (SELECT COUNT(*) FROM [log].ETL_ErrorLog WHERE RunID = @RunID),
           NombreLignesTotal = (SELECT ISNULL(SUM(NombreLignes), 0) FROM [log].ETL_RowCount WHERE RunID = @RunID)
    WHERE  RunID = @RunID;
END;
GO

-- Démarrer le log d'un package
CREATE OR ALTER PROCEDURE [log].usp_StartPackage
    @RunID          INT,
    @NomPackage     NVARCHAR(200),
    @Niveau         INT             = 1,
    @PackageLogID   INT             OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [log].ETL_PackageLog (RunID, NomPackage, NiveauHierarchie)
    VALUES (@RunID, @NomPackage, @Niveau);
    SET @PackageLogID = SCOPE_IDENTITY();
END;
GO

-- Terminer le log d'un package
CREATE OR ALTER PROCEDURE [log].usp_EndPackage
    @PackageLogID   INT,
    @Statut         NVARCHAR(20) = N'SUCCES',
    @NbInsert       INT = 0,
    @NbUpdate       INT = 0,
    @NbErreur       INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [log].ETL_PackageLog
    SET    DateFin              = SYSUTCDATETIME(),
           Statut               = @Statut,
           NombreLignesInsert   = @NbInsert,
           NombreLignesUpdate   = @NbUpdate,
           NombreLignesErreur   = @NbErreur
    WHERE  PackageLogID = @PackageLogID;
END;
GO

-- Enregistrer une erreur ETL
CREATE OR ALTER PROCEDURE [log].usp_LogError
    @RunID              INT,
    @PackageLogID       INT             = NULL,
    @NomPackage         NVARCHAR(200)   = NULL,
    @NomTache           NVARCHAR(200)   = NULL,
    @TableSource        NVARCHAR(100)   = NULL,
    @TableCible         NVARCHAR(100)   = NULL,
    @CleLigne           NVARCHAR(200)   = NULL,
    @CodeErreur         INT             = NULL,
    @MessageErreur      NVARCHAR(MAX)   = NULL,
    @Severite           NVARCHAR(20)    = N'ERREUR'
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [log].ETL_ErrorLog (
        RunID, PackageLogID, NomPackage, NomTache,
        TableSource, TableCible, CleLigne,
        CodeErreur, MessageErreur, Severite
    ) VALUES (
        @RunID, @PackageLogID, @NomPackage, @NomTache,
        @TableSource, @TableCible, @CleLigne,
        @CodeErreur, @MessageErreur, @Severite
    );
END;
GO

-- Enregistrer un compteur de lignes
CREATE OR ALTER PROCEDURE [log].usp_LogRowCount
    @RunID          INT,
    @NomTable       NVARCHAR(100),
    @Phase          NVARCHAR(20),
    @TypeOperation  NVARCHAR(20),
    @NombreLignes   INT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO [log].ETL_RowCount (RunID, NomTable, Phase, TypeOperation, NombreLignes)
    VALUES (@RunID, @NomTable, @Phase, @TypeOperation, @NombreLignes);
END;
GO

-- ============================================================
-- VUE DE RAPPORT : Dernier statut ETL par table
-- ============================================================
CREATE OR ALTER VIEW [log].v_DernierRun
AS
SELECT
    r.RunID,
    r.DateDebut,
    r.DateFin,
    r.DureeSecondes,
    r.Statut,
    r.TypeExecution,
    r.NombreErreurs,
    r.NombreLignesTotal
FROM [log].ETL_Run r
WHERE r.RunID = (SELECT MAX(RunID) FROM [log].ETL_Run);
GO

-- Vue : Historique des 10 derniers runs
CREATE OR ALTER VIEW [log].v_HistoriqueRuns
AS
SELECT TOP 10
    RunID,
    DateDebut,
    DateFin,
    DureeSecondes,
    Statut,
    TypeExecution,
    NomEnvironnement,
    NombreLignesTotal,
    NombreErreurs
FROM [log].ETL_Run
ORDER BY RunID DESC;
GO

PRINT N'Tables de log ETL créées avec succès (schéma [log]).';
GO
