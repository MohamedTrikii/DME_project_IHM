-- ============================================================
-- Fichier : 03_DME_DataWarehouse_Schema.sql
-- Description : Création du Data Warehouse DME_DataWarehouse
--               Schéma en étoile pour l'analyse décisionnelle
-- Projet : Business Intelligence - Système DME Tunisien
-- Cours : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================

USE master;
GO

-- Suppression de la base si elle existe
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DME_DataWarehouse')
BEGIN
    ALTER DATABASE DME_DataWarehouse SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DME_DataWarehouse;
END
GO

-- Création du Data Warehouse
CREATE DATABASE DME_DataWarehouse;
GO

USE DME_DataWarehouse;
GO

-- ============================================================
-- TABLES DE DIMENSIONS
-- ============================================================

-- Dimension Date (calendrier complet pour toutes les analyses temporelles)
CREATE TABLE Dim_Date (
    DateKey             INT         NOT NULL PRIMARY KEY,  -- Format YYYYMMDD
    DateComplete        DATE        NOT NULL,
    Jour                TINYINT     NOT NULL,
    Mois                TINYINT     NOT NULL,
    NomMois             NVARCHAR(20) NOT NULL,
    Trimestre           TINYINT     NOT NULL,
    Annee               SMALLINT    NOT NULL,
    Semaine             TINYINT     NOT NULL,
    JourSemaine         TINYINT     NOT NULL,  -- 1=Lundi ... 7=Dimanche
    NomJourSemaine      NVARCHAR(15) NOT NULL,
    EstWeekend          BIT         NOT NULL DEFAULT 0,
    EstFerie            BIT         NOT NULL DEFAULT 0
);
GO

-- Dimension Patient (données démographiques et administratives)
CREATE TABLE Dim_Patient (
    PatientKey          INT             IDENTITY(1,1) PRIMARY KEY,
    PatientID           INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Prenom              NVARCHAR(100)   NOT NULL,
    Sexe                NCHAR(1)        NOT NULL,
    DateNaissance       DATE            NOT NULL,
    Age                 INT             NOT NULL,
    GroupeAge           NVARCHAR(20)    NOT NULL,  -- 0-17, 18-35, 36-55, 56-75, 75+
    Ville               NVARCHAR(100)   NULL,
    Gouvernorat         NVARCHAR(100)   NULL,
    GroupeSanguin       NVARCHAR(5)     NULL,
    Assurance           NVARCHAR(50)    NULL,
    Statut              NVARCHAR(20)    NOT NULL DEFAULT 'actif'
);
GO

-- Dimension Médecin (profil et compétences)
CREATE TABLE Dim_Medecin (
    MedecinKey          INT             IDENTITY(1,1) PRIMARY KEY,
    MedecinID           INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Prenom              NVARCHAR(100)   NOT NULL,
    Specialite          NVARCHAR(100)   NULL,
    Hopital             NVARCHAR(150)   NULL,
    Ville               NVARCHAR(100)   NULL,
    Gouvernorat         NVARCHAR(100)   NULL,
    AnneesExperience    INT             NULL,
    NiveauExperience    NVARCHAR(20)    NOT NULL  -- Junior (0-5), Senior (6-14), Expert (15+)
);
GO

-- Dimension Spécialité médicale
CREATE TABLE Dim_Specialite (
    SpecialiteKey       INT             IDENTITY(1,1) PRIMARY KEY,
    SpecialiteID        INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Description         NVARCHAR(500)   NULL
);
GO

-- Dimension Diagnostic (codes CIM-10)
CREATE TABLE Dim_Diagnostic (
    DiagnosticKey       INT             IDENTITY(1,1) PRIMARY KEY,
    DiagnosticID        INT             NOT NULL,
    CodeCIM10           NVARCHAR(10)    NOT NULL,
    Libelle             NVARCHAR(200)   NOT NULL,
    Categorie           NVARCHAR(100)   NULL
);
GO

-- Dimension Médicament
CREATE TABLE Dim_Medicament (
    MedicamentKey       INT             IDENTITY(1,1) PRIMARY KEY,
    MedicamentID        INT             NOT NULL,
    NomCommercial       NVARCHAR(150)   NOT NULL,
    NomGenerique        NVARCHAR(150)   NULL,
    Classe              NVARCHAR(100)   NULL,
    Forme               NVARCHAR(100)   NULL,
    Dosage              NVARCHAR(100)   NULL
);
GO

-- Dimension Type d'analyse
CREATE TABLE Dim_TypeAnalyse (
    TypeAnalyseKey      INT             IDENTITY(1,1) PRIMARY KEY,
    TypeAnalyseID       INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Unite               NVARCHAR(50)    NULL
);
GO

-- Dimension Hôpital
CREATE TABLE Dim_Hopital (
    HopitalKey          INT             IDENTITY(1,1) PRIMARY KEY,
    HopitalID           INT             NOT NULL,
    Nom                 NVARCHAR(150)   NOT NULL,
    Type                NVARCHAR(50)    NOT NULL,
    Ville               NVARCHAR(100)   NULL,
    Gouvernorat         NVARCHAR(100)   NULL
);
GO

-- Dimension Gouvernorat (avec région géographique)
CREATE TABLE Dim_Gouvernorat (
    GouvernoratKey      INT             IDENTITY(1,1) PRIMARY KEY,
    GouvernoratID       INT             NOT NULL,
    Nom                 NVARCHAR(100)   NOT NULL,
    Region              NVARCHAR(30)    NOT NULL  -- Nord, Centre, Sud, Côtière
);
GO

-- ============================================================
-- TABLES DE FAITS
-- ============================================================

-- Fait Consultation (table de faits centrale)
CREATE TABLE Fact_Consultation (
    ConsultationKey     INT             IDENTITY(1,1) PRIMARY KEY,
    DateKey             INT             NOT NULL,
    PatientKey          INT             NOT NULL,
    MedecinKey          INT             NOT NULL,
    DiagnosticKey       INT             NOT NULL,
    HopitalKey          INT             NOT NULL,
    ConsultationID      INT             NOT NULL,
    TypeConsultation    NVARCHAR(50)    NOT NULL,
    DureeMinutes        INT             NULL,
    NombreOrdonnances   INT             NOT NULL DEFAULT 0,
    NombreAnalyses      INT             NOT NULL DEFAULT 0,
    EstUrgence          BIT             NOT NULL DEFAULT 0,
    CONSTRAINT FK_FactConsult_Date      FOREIGN KEY (DateKey)       REFERENCES Dim_Date(DateKey),
    CONSTRAINT FK_FactConsult_Patient   FOREIGN KEY (PatientKey)    REFERENCES Dim_Patient(PatientKey),
    CONSTRAINT FK_FactConsult_Medecin   FOREIGN KEY (MedecinKey)    REFERENCES Dim_Medecin(MedecinKey),
    CONSTRAINT FK_FactConsult_Diagno    FOREIGN KEY (DiagnosticKey) REFERENCES Dim_Diagnostic(DiagnosticKey),
    CONSTRAINT FK_FactConsult_Hopital   FOREIGN KEY (HopitalKey)    REFERENCES Dim_Hopital(HopitalKey)
);
GO

-- Fait Ordonnance
CREATE TABLE Fact_Ordonnance (
    OrdonnanceKey       INT             IDENTITY(1,1) PRIMARY KEY,
    DateKey             INT             NOT NULL,
    PatientKey          INT             NOT NULL,
    MedecinKey          INT             NOT NULL,
    MedicamentKey       INT             NOT NULL,
    ConsultationKey     INT             NOT NULL,
    OrdonnanceID        INT             NOT NULL,
    DureeTrtJours       INT             NULL,
    CONSTRAINT FK_FactOrdo_Date         FOREIGN KEY (DateKey)       REFERENCES Dim_Date(DateKey),
    CONSTRAINT FK_FactOrdo_Patient      FOREIGN KEY (PatientKey)    REFERENCES Dim_Patient(PatientKey),
    CONSTRAINT FK_FactOrdo_Medecin      FOREIGN KEY (MedecinKey)    REFERENCES Dim_Medecin(MedecinKey),
    CONSTRAINT FK_FactOrdo_Medicament   FOREIGN KEY (MedicamentKey) REFERENCES Dim_Medicament(MedicamentKey),
    CONSTRAINT FK_FactOrdo_Consult      FOREIGN KEY (ConsultationKey) REFERENCES Fact_Consultation(ConsultationKey)
);
GO

-- Fait Analyse (demande + résultat)
CREATE TABLE Fact_Analyse (
    AnalyseKey          INT             IDENTITY(1,1) PRIMARY KEY,
    DateDemandeKey      INT             NOT NULL,
    DateResultatKey     INT             NULL,
    PatientKey          INT             NOT NULL,
    MedecinKey          INT             NOT NULL,
    TypeAnalyseKey      INT             NOT NULL,
    HopitalKey          INT             NOT NULL,
    DemandeID           INT             NOT NULL,
    Valeur              DECIMAL(10,3)   NULL,
    EstAnormal          BIT             NOT NULL DEFAULT 0,
    EstUrgent           BIT             NOT NULL DEFAULT 0,
    DelaiResultatJours  INT             NULL,
    CONSTRAINT FK_FactAnalyse_DateDem   FOREIGN KEY (DateDemandeKey)  REFERENCES Dim_Date(DateKey),
    CONSTRAINT FK_FactAnalyse_DateRes   FOREIGN KEY (DateResultatKey) REFERENCES Dim_Date(DateKey),
    CONSTRAINT FK_FactAnalyse_Patient   FOREIGN KEY (PatientKey)      REFERENCES Dim_Patient(PatientKey),
    CONSTRAINT FK_FactAnalyse_Medecin   FOREIGN KEY (MedecinKey)      REFERENCES Dim_Medecin(MedecinKey),
    CONSTRAINT FK_FactAnalyse_TypeAna   FOREIGN KEY (TypeAnalyseKey)  REFERENCES Dim_TypeAnalyse(TypeAnalyseKey),
    CONSTRAINT FK_FactAnalyse_Hopital   FOREIGN KEY (HopitalKey)      REFERENCES Dim_Hopital(HopitalKey)
);
GO

-- Fait Hospitalisation
CREATE TABLE Fact_Hospitalisation (
    HospitalisationKey  INT             IDENTITY(1,1) PRIMARY KEY,
    DateEntreeKey       INT             NOT NULL,
    DateSortieKey       INT             NULL,
    PatientKey          INT             NOT NULL,
    MedecinKey          INT             NOT NULL,
    DiagnosticKey       INT             NOT NULL,
    HopitalKey          INT             NOT NULL,
    HospitalisationID   INT             NOT NULL,
    DureeSejourJours    INT             NULL,
    CoutSejour          DECIMAL(10,2)   NULL,
    Service             NVARCHAR(100)   NULL,
    CONSTRAINT FK_FactHospi_DateEntree  FOREIGN KEY (DateEntreeKey)  REFERENCES Dim_Date(DateKey),
    CONSTRAINT FK_FactHospi_DateSortie  FOREIGN KEY (DateSortieKey)  REFERENCES Dim_Date(DateKey),
    CONSTRAINT FK_FactHospi_Patient     FOREIGN KEY (PatientKey)     REFERENCES Dim_Patient(PatientKey),
    CONSTRAINT FK_FactHospi_Medecin     FOREIGN KEY (MedecinKey)     REFERENCES Dim_Medecin(MedecinKey),
    CONSTRAINT FK_FactHospi_Diagno      FOREIGN KEY (DiagnosticKey)  REFERENCES Dim_Diagnostic(DiagnosticKey),
    CONSTRAINT FK_FactHospi_Hopital     FOREIGN KEY (HopitalKey)     REFERENCES Dim_Hopital(HopitalKey)
);
GO

-- ============================================================
-- PROCÉDURE STOCKÉE : Remplissage de Dim_Date
-- ============================================================
CREATE OR ALTER PROCEDURE sp_Remplir_Dim_Date
    @AnneeDebut SMALLINT = 2020,
    @AnneeFin   SMALLINT = 2026
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DateCourante DATE = DATEFROMPARTS(@AnneeDebut, 1, 1);
    DECLARE @DateFin      DATE = DATEFROMPARTS(@AnneeFin, 12, 31);

    -- Noms des mois en français
    DECLARE @NomsMois TABLE (NumMois TINYINT, NomMois NVARCHAR(20));
    INSERT INTO @NomsMois VALUES
        (1, N'Janvier'), (2, N'Février'),  (3, N'Mars'),
        (4, N'Avril'),   (5, N'Mai'),      (6, N'Juin'),
        (7, N'Juillet'), (8, N'Août'),     (9, N'Septembre'),
        (10, N'Octobre'),(11, N'Novembre'),(12, N'Décembre');

    -- Noms des jours en français
    DECLARE @NomsJours TABLE (NumJour TINYINT, NomJour NVARCHAR(15));
    INSERT INTO @NomsJours VALUES
        (1, N'Lundi'), (2, N'Mardi'), (3, N'Mercredi'),
        (4, N'Jeudi'), (5, N'Vendredi'), (6, N'Samedi'), (7, N'Dimanche');

    -- Jours fériés tunisiens (fixes chaque année sur la période 2020-2026)
    DECLARE @JoursFeries TABLE (MoisJour NVARCHAR(5));  -- format MM-DD
    INSERT INTO @JoursFeries VALUES
        ('01-01'),  -- Nouvel An
        ('03-20'),  -- Fête de l'Indépendance
        ('04-09'),  -- Journée des Martyrs
        ('05-01'),  -- Fête du Travail
        ('06-01'),  -- Fête de la Jeunesse
        ('07-25'),  -- Fête de la République
        ('08-13'),  -- Fête de la Femme
        ('10-15'),  -- Fête de l'Évacuation
        ('11-07');  -- Anniversaire du Changement

    -- Suppression des données existantes pour la période
    DELETE FROM Dim_Date
    WHERE Annee BETWEEN @AnneeDebut AND @AnneeFin;

    -- Insertion jour par jour
    WHILE @DateCourante <= @DateFin
    BEGIN
        DECLARE @DateKey        INT       = YEAR(@DateCourante) * 10000 + MONTH(@DateCourante) * 100 + DAY(@DateCourante);
        DECLARE @Jour           TINYINT   = DAY(@DateCourante);
        DECLARE @Mois           TINYINT   = MONTH(@DateCourante);
        DECLARE @Annee          SMALLINT  = YEAR(@DateCourante);
        DECLARE @Trimestre      TINYINT   = ((@Mois - 1) / 3) + 1;
        DECLARE @Semaine        TINYINT   = DATEPART(ISO_WEEK, @DateCourante);
        DECLARE @JourSemaine    TINYINT   = DATEPART(WEEKDAY, @DateCourante);  -- 1=Dim...7=Sam (SQL Server)
        -- Conversion vers ISO (1=Lundi...7=Dimanche)
        DECLARE @JourSemaineISO TINYINT   = CASE WHEN @JourSemaine = 1 THEN 7 ELSE @JourSemaine - 1 END;
        DECLARE @EstWeekend     BIT       = CASE WHEN @JourSemaineISO IN (6, 7) THEN 1 ELSE 0 END;
        DECLARE @MoisJour       NVARCHAR(5) = RIGHT('0' + CAST(@Mois AS VARCHAR(2)), 2) + '-' + RIGHT('0' + CAST(@Jour AS VARCHAR(2)), 2);
        DECLARE @EstFerie       BIT       = CASE WHEN EXISTS (SELECT 1 FROM @JoursFeries WHERE MoisJour = @MoisJour) THEN 1 ELSE 0 END;

        DECLARE @NomMois        NVARCHAR(20) = (SELECT NomMois FROM @NomsMois WHERE NumMois = @Mois);
        DECLARE @NomJour        NVARCHAR(15) = (SELECT NomJour FROM @NomsJours WHERE NumJour = @JourSemaineISO);

        INSERT INTO Dim_Date (DateKey, DateComplete, Jour, Mois, NomMois, Trimestre, Annee, Semaine, JourSemaine, NomJourSemaine, EstWeekend, EstFerie)
        VALUES (@DateKey, @DateCourante, @Jour, @Mois, @NomMois, @Trimestre, @Annee, @Semaine, @JourSemaineISO, @NomJour, @EstWeekend, @EstFerie);

        SET @DateCourante = DATEADD(DAY, 1, @DateCourante);
    END;

    DECLARE @NbLignes INT = (SELECT COUNT(*) FROM Dim_Date WHERE Annee BETWEEN @AnneeDebut AND @AnneeFin);
    PRINT CONCAT('Dim_Date peuplée : ', @NbLignes, ' dates (', @AnneeDebut, ' - ', @AnneeFin, ')');
END;
GO

-- ============================================================
-- INDEX pour les tables de faits (performance des requêtes OLAP)
-- ============================================================

CREATE INDEX IX_FactConsult_DateKey        ON Fact_Consultation(DateKey);
CREATE INDEX IX_FactConsult_PatientKey     ON Fact_Consultation(PatientKey);
CREATE INDEX IX_FactConsult_MedecinKey     ON Fact_Consultation(MedecinKey);
CREATE INDEX IX_FactConsult_DiagnoKey      ON Fact_Consultation(DiagnosticKey);
CREATE INDEX IX_FactOrdo_DateKey           ON Fact_Ordonnance(DateKey);
CREATE INDEX IX_FactOrdo_MedicamentKey     ON Fact_Ordonnance(MedicamentKey);
CREATE INDEX IX_FactOrdo_PatientKey        ON Fact_Ordonnance(PatientKey);
CREATE INDEX IX_FactAnalyse_DateDemKey     ON Fact_Analyse(DateDemandeKey);
CREATE INDEX IX_FactAnalyse_PatientKey     ON Fact_Analyse(PatientKey);
CREATE INDEX IX_FactAnalyse_TypeAnaKey     ON Fact_Analyse(TypeAnalyseKey);
CREATE INDEX IX_FactHospi_DateEntreeKey    ON Fact_Hospitalisation(DateEntreeKey);
CREATE INDEX IX_FactHospi_PatientKey       ON Fact_Hospitalisation(PatientKey);
CREATE INDEX IX_FactHospi_HopitalKey       ON Fact_Hospitalisation(HopitalKey);
GO

PRINT 'Base DME_DataWarehouse créée avec succès (dimensions + faits + procédure sp_Remplir_Dim_Date).';
GO
