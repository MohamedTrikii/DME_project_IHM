-- ============================================================
-- Fichier : 01_DME_SourceDB_Schema.sql
-- Description : Création de la base OLTP source DME_SourceDB
-- Projet : Business Intelligence - Système DME Tunisien
-- Cours : 2 GLID 2025-2026 - Dr. Salma DAMMAK / Dr. Taher Labidi
-- ============================================================

USE master;
GO

-- Suppression de la base si elle existe déjà
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'DME_SourceDB')
BEGIN
    ALTER DATABASE DME_SourceDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DME_SourceDB;
END
GO

-- Création de la base de données OLTP source
CREATE DATABASE DME_SourceDB;
GO

USE DME_SourceDB;
GO

-- ============================================================
-- TABLES DE RÉFÉRENCE
-- ============================================================

-- Table des gouvernorats tunisiens
CREATE TABLE Gouvernorats (
    GouvernoratID   INT           IDENTITY(1,1) PRIMARY KEY,
    Nom             NVARCHAR(100) NOT NULL
);
GO

-- Table des villes
CREATE TABLE Villes (
    VilleID         INT           IDENTITY(1,1) PRIMARY KEY,
    Nom             NVARCHAR(100) NOT NULL,
    GouvernoratID   INT           NOT NULL,
    CONSTRAINT FK_Villes_Gouvernorats FOREIGN KEY (GouvernoratID) REFERENCES Gouvernorats(GouvernoratID)
);
GO

-- Table des spécialités médicales
CREATE TABLE Specialites (
    SpecialiteID    INT           IDENTITY(1,1) PRIMARY KEY,
    Nom             NVARCHAR(100) NOT NULL,
    Description     NVARCHAR(500) NULL
);
GO

-- Table des types d'analyse médicale
CREATE TABLE TypesAnalyse (
    TypeAnalyseID       INT              IDENTITY(1,1) PRIMARY KEY,
    Nom                 NVARCHAR(100)    NOT NULL,
    Unite               NVARCHAR(50)     NULL,
    ValeurNormaleMin    DECIMAL(10,3)    NULL,
    ValeurNormaleMax    DECIMAL(10,3)    NULL
);
GO

-- Table des médicaments
CREATE TABLE Medicaments (
    MedicamentID    INT           IDENTITY(1,1) PRIMARY KEY,
    NomCommercial   NVARCHAR(150) NOT NULL,
    NomGenerique    NVARCHAR(150) NULL,
    Classe          NVARCHAR(100) NULL,
    Forme           NVARCHAR(100) NULL,
    Dosage          NVARCHAR(100) NULL
);
GO

-- Table des diagnostics avec codes CIM-10
CREATE TABLE Diagnostics (
    DiagnosticID    INT           IDENTITY(1,1) PRIMARY KEY,
    CodeCIM10       NVARCHAR(10)  NOT NULL,
    Libelle         NVARCHAR(200) NOT NULL,
    Categorie       NVARCHAR(100) NULL
);
GO

-- Table des hôpitaux et cliniques
CREATE TABLE Hopitaux (
    HopitalID       INT           IDENTITY(1,1) PRIMARY KEY,
    Nom             NVARCHAR(150) NOT NULL,
    Type            NVARCHAR(50)  NOT NULL,  -- Public, Privé, Clinique
    VilleID         INT           NOT NULL,
    Adresse         NVARCHAR(250) NULL,
    Telephone       NVARCHAR(20)  NULL,
    CONSTRAINT FK_Hopitaux_Villes FOREIGN KEY (VilleID) REFERENCES Villes(VilleID)
);
GO

-- ============================================================
-- TABLES UTILISATEURS
-- ============================================================

-- Table centrale des utilisateurs (tous les acteurs du système)
CREATE TABLE Utilisateurs (
    UtilisateurID       INT             IDENTITY(1,1) PRIMARY KEY,
    Nom                 NVARCHAR(100)   NOT NULL,
    Prenom              NVARCHAR(100)   NOT NULL,
    Email               NVARCHAR(200)   NOT NULL UNIQUE,
    MotDePasse          NVARCHAR(255)   NOT NULL,
    Role                NVARCHAR(50)    NOT NULL,  -- patient, medecin, infirmier, laboratoire, admin
    Statut              NVARCHAR(20)    NOT NULL DEFAULT 'actif',
    DateCreation        DATETIME        NOT NULL DEFAULT GETDATE(),
    DerniereConnexion   DATETIME        NULL
);
GO

-- Table des patients (liée à Utilisateurs)
CREATE TABLE Patients (
    PatientID           INT             PRIMARY KEY,
    DateNaissance       DATE            NOT NULL,
    Sexe                NCHAR(1)        NOT NULL,  -- M ou F
    Adresse             NVARCHAR(250)   NULL,
    VilleID             INT             NULL,
    Telephone           NVARCHAR(20)    NULL,
    GroupeSanguin       NVARCHAR(5)     NULL,
    Allergies           NVARCHAR(500)   NULL,
    Assurance           NVARCHAR(50)    NULL,  -- CNAM, Privée, Sans
    NumeroAssurance     NVARCHAR(50)    NULL,
    CONSTRAINT FK_Patients_Utilisateurs FOREIGN KEY (PatientID) REFERENCES Utilisateurs(UtilisateurID),
    CONSTRAINT FK_Patients_Villes       FOREIGN KEY (VilleID)   REFERENCES Villes(VilleID)
);
GO

-- Table des médecins (liée à Utilisateurs)
CREATE TABLE Medecins (
    MedecinID           INT             PRIMARY KEY,
    SpecialiteID        INT             NULL,
    HopitalID           INT             NULL,
    NumeroOrdre         NVARCHAR(50)    NULL,
    Adresse             NVARCHAR(250)   NULL,
    Telephone           NVARCHAR(20)    NULL,
    AnneesExperience    INT             NULL DEFAULT 0,
    CONSTRAINT FK_Medecins_Utilisateurs  FOREIGN KEY (MedecinID)    REFERENCES Utilisateurs(UtilisateurID),
    CONSTRAINT FK_Medecins_Specialites   FOREIGN KEY (SpecialiteID) REFERENCES Specialites(SpecialiteID),
    CONSTRAINT FK_Medecins_Hopitaux      FOREIGN KEY (HopitalID)    REFERENCES Hopitaux(HopitalID)
);
GO

-- Table des infirmiers (liée à Utilisateurs)
CREATE TABLE Infirmiers (
    InfirmierID         INT             PRIMARY KEY,
    Service             NVARCHAR(100)   NULL,
    HopitalID           INT             NULL,
    Telephone           NVARCHAR(20)    NULL,
    CONSTRAINT FK_Infirmiers_Utilisateurs FOREIGN KEY (InfirmierID) REFERENCES Utilisateurs(UtilisateurID),
    CONSTRAINT FK_Infirmiers_Hopitaux     FOREIGN KEY (HopitalID)   REFERENCES Hopitaux(HopitalID)
);
GO

-- Table des laboratoires (liée à Utilisateurs)
CREATE TABLE Laboratoires (
    LaboratoireID       INT             PRIMARY KEY,
    NomLaboratoire      NVARCHAR(150)   NOT NULL,
    VilleID             INT             NULL,
    Adresse             NVARCHAR(250)   NULL,
    Telephone           NVARCHAR(20)    NULL,
    Agree               BIT             NOT NULL DEFAULT 1,
    CONSTRAINT FK_Laboratoires_Utilisateurs FOREIGN KEY (LaboratoireID) REFERENCES Utilisateurs(UtilisateurID),
    CONSTRAINT FK_Laboratoires_Villes       FOREIGN KEY (VilleID)       REFERENCES Villes(VilleID)
);
GO

-- Table des administrateurs (liée à Utilisateurs)
CREATE TABLE Admins (
    AdminID             INT             PRIMARY KEY,
    NiveauAcces         INT             NOT NULL DEFAULT 1,
    CONSTRAINT FK_Admins_Utilisateurs FOREIGN KEY (AdminID) REFERENCES Utilisateurs(UtilisateurID)
);
GO

-- ============================================================
-- TABLES MÉTIER
-- ============================================================

-- Table des Dossiers Médicaux Électroniques
CREATE TABLE DME (
    DMEID           INT             IDENTITY(1,1) PRIMARY KEY,
    PatientID       INT             NOT NULL,
    DateCreation    DATETIME        NOT NULL DEFAULT GETDATE(),
    Statut          NVARCHAR(20)    NOT NULL DEFAULT 'actif',  -- actif, inactif, archivé
    CONSTRAINT FK_DME_Patients FOREIGN KEY (PatientID) REFERENCES Patients(PatientID)
);
GO

-- Table des consultations médicales
CREATE TABLE Consultations (
    ConsultationID      INT             IDENTITY(1,1) PRIMARY KEY,
    DMEID               INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    DiagnosticID        INT             NULL,
    DateConsultation    DATETIME        NOT NULL,
    Motif               NVARCHAR(300)   NULL,
    Notes               NVARCHAR(1000)  NULL,
    Traitement          NVARCHAR(500)   NULL,
    TypeConsultation    NVARCHAR(50)    NOT NULL DEFAULT 'Standard',  -- Standard, Urgence, Suivi
    DureeMinutes        INT             NULL,
    HopitalID           INT             NULL,
    CONSTRAINT FK_Consultations_DME        FOREIGN KEY (DMEID)       REFERENCES DME(DMEID),
    CONSTRAINT FK_Consultations_Patients   FOREIGN KEY (PatientID)   REFERENCES Patients(PatientID),
    CONSTRAINT FK_Consultations_Medecins   FOREIGN KEY (MedecinID)   REFERENCES Medecins(MedecinID),
    CONSTRAINT FK_Consultations_Diagno     FOREIGN KEY (DiagnosticID) REFERENCES Diagnostics(DiagnosticID),
    CONSTRAINT FK_Consultations_Hopitaux   FOREIGN KEY (HopitalID)   REFERENCES Hopitaux(HopitalID)
);
GO

-- Table des ordonnances médicales
CREATE TABLE Ordonnances (
    OrdonnanceID        INT             IDENTITY(1,1) PRIMARY KEY,
    ConsultationID      INT             NOT NULL,
    DMEID               INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    MedicamentID        INT             NOT NULL,
    Posologie           NVARCHAR(200)   NULL,
    DureeTrt            NVARCHAR(100)   NULL,
    DatePrescription    DATE            NOT NULL,
    Instructions        NVARCHAR(500)   NULL,
    CONSTRAINT FK_Ordonnances_Consultations FOREIGN KEY (ConsultationID) REFERENCES Consultations(ConsultationID),
    CONSTRAINT FK_Ordonnances_DME           FOREIGN KEY (DMEID)          REFERENCES DME(DMEID),
    CONSTRAINT FK_Ordonnances_Patients      FOREIGN KEY (PatientID)      REFERENCES Patients(PatientID),
    CONSTRAINT FK_Ordonnances_Medecins      FOREIGN KEY (MedecinID)      REFERENCES Medecins(MedecinID),
    CONSTRAINT FK_Ordonnances_Medicaments   FOREIGN KEY (MedicamentID)   REFERENCES Medicaments(MedicamentID)
);
GO

-- Table des demandes d'analyse
CREATE TABLE DemandesAnalyse (
    DemandeID           INT             IDENTITY(1,1) PRIMARY KEY,
    DMEID               INT             NOT NULL,
    PatientID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    LaboratoireID       INT             NULL,
    TypeAnalyseID       INT             NOT NULL,
    DateDemande         DATE            NOT NULL,
    Urgence             BIT             NOT NULL DEFAULT 0,
    Description         NVARCHAR(500)   NULL,
    Statut              NVARCHAR(50)    NOT NULL DEFAULT 'En attente',  -- En attente, En cours, Terminé
    CONSTRAINT FK_DemandesAnalyse_DME          FOREIGN KEY (DMEID)         REFERENCES DME(DMEID),
    CONSTRAINT FK_DemandesAnalyse_Patients     FOREIGN KEY (PatientID)     REFERENCES Patients(PatientID),
    CONSTRAINT FK_DemandesAnalyse_Medecins     FOREIGN KEY (MedecinID)     REFERENCES Medecins(MedecinID),
    CONSTRAINT FK_DemandesAnalyse_Labos        FOREIGN KEY (LaboratoireID) REFERENCES Laboratoires(LaboratoireID),
    CONSTRAINT FK_DemandesAnalyse_TypeAnalyse  FOREIGN KEY (TypeAnalyseID) REFERENCES TypesAnalyse(TypeAnalyseID)
);
GO

-- Table des résultats d'analyse
CREATE TABLE ResultatsAnalyse (
    ResultatID          INT             IDENTITY(1,1) PRIMARY KEY,
    DemandeID           INT             NOT NULL,
    LaboratoireID       INT             NULL,
    Valeur              DECIMAL(10,3)   NULL,
    Unite               NVARCHAR(50)    NULL,
    Resultat            NVARCHAR(500)   NULL,
    Interpretation      NVARCHAR(500)   NULL,
    DateResultat        DATE            NOT NULL,
    Anormal             BIT             NOT NULL DEFAULT 0,
    CONSTRAINT FK_ResultatsAnalyse_Demandes  FOREIGN KEY (DemandeID)     REFERENCES DemandesAnalyse(DemandeID),
    CONSTRAINT FK_ResultatsAnalyse_Labos     FOREIGN KEY (LaboratoireID) REFERENCES Laboratoires(LaboratoireID)
);
GO

-- Table des observations infirmières
CREATE TABLE Observations (
    ObservationID       INT             IDENTITY(1,1) PRIMARY KEY,
    DMEID               INT             NOT NULL,
    PatientID           INT             NOT NULL,
    InfirmierID         INT             NOT NULL,
    Contenu             NVARCHAR(1000)  NULL,
    TensionArterielle   NVARCHAR(20)    NULL,
    Temperature         DECIMAL(4,1)    NULL,
    PoulsMin            INT             NULL,
    Poids               DECIMAL(5,2)    NULL,
    DateObservation     DATETIME        NOT NULL,
    CONSTRAINT FK_Observations_DME       FOREIGN KEY (DMEID)       REFERENCES DME(DMEID),
    CONSTRAINT FK_Observations_Patients  FOREIGN KEY (PatientID)   REFERENCES Patients(PatientID),
    CONSTRAINT FK_Observations_Infirm    FOREIGN KEY (InfirmierID) REFERENCES Infirmiers(InfirmierID)
);
GO

-- Table des hospitalisations
CREATE TABLE Hospitalisations (
    HospitalisationID   INT             IDENTITY(1,1) PRIMARY KEY,
    PatientID           INT             NOT NULL,
    DMEID               INT             NOT NULL,
    HopitalID           INT             NOT NULL,
    MedecinID           INT             NOT NULL,
    DateEntree          DATE            NOT NULL,
    DateSortie          DATE            NULL,
    Service             NVARCHAR(100)   NULL,
    MotifEntree         NVARCHAR(300)   NULL,
    DiagnosticID        INT             NULL,
    CoutSejour          DECIMAL(10,2)   NULL,
    CONSTRAINT FK_Hospitalisations_Patients   FOREIGN KEY (PatientID)   REFERENCES Patients(PatientID),
    CONSTRAINT FK_Hospitalisations_DME        FOREIGN KEY (DMEID)       REFERENCES DME(DMEID),
    CONSTRAINT FK_Hospitalisations_Hopitaux   FOREIGN KEY (HopitalID)   REFERENCES Hopitaux(HopitalID),
    CONSTRAINT FK_Hospitalisations_Medecins   FOREIGN KEY (MedecinID)   REFERENCES Medecins(MedecinID),
    CONSTRAINT FK_Hospitalisations_Diagno     FOREIGN KEY (DiagnosticID) REFERENCES Diagnostics(DiagnosticID)
);
GO

-- Table des messages entre utilisateurs
CREATE TABLE Messages (
    MessageID       INT             IDENTITY(1,1) PRIMARY KEY,
    ExpediteurID    INT             NOT NULL,
    DestinataireID  INT             NOT NULL,
    Contenu         NVARCHAR(2000)  NOT NULL,
    DateEnvoi       DATETIME        NOT NULL DEFAULT GETDATE(),
    Lu              BIT             NOT NULL DEFAULT 0,
    CONSTRAINT FK_Messages_Expediteur    FOREIGN KEY (ExpediteurID)   REFERENCES Utilisateurs(UtilisateurID),
    CONSTRAINT FK_Messages_Destinataire  FOREIGN KEY (DestinataireID) REFERENCES Utilisateurs(UtilisateurID)
);
GO

-- Table des logs d'accès au système
CREATE TABLE LogsAcces (
    LogID           INT             IDENTITY(1,1) PRIMARY KEY,
    UtilisateurID   INT             NOT NULL,
    Action          NVARCHAR(100)   NOT NULL,
    DateAction      DATETIME        NOT NULL DEFAULT GETDATE(),
    IPAdresse       NVARCHAR(50)    NULL,
    Details         NVARCHAR(500)   NULL,
    CONSTRAINT FK_LogsAcces_Utilisateurs FOREIGN KEY (UtilisateurID) REFERENCES Utilisateurs(UtilisateurID)
);
GO

-- ============================================================
-- INDEX pour améliorer les performances
-- ============================================================

CREATE INDEX IX_Consultations_DateConsultation ON Consultations(DateConsultation);
CREATE INDEX IX_Consultations_PatientID        ON Consultations(PatientID);
CREATE INDEX IX_Consultations_MedecinID        ON Consultations(MedecinID);
CREATE INDEX IX_Ordonnances_DatePrescription   ON Ordonnances(DatePrescription);
CREATE INDEX IX_DemandesAnalyse_DateDemande    ON DemandesAnalyse(DateDemande);
CREATE INDEX IX_ResultatsAnalyse_DateResultat  ON ResultatsAnalyse(DateResultat);
CREATE INDEX IX_Hospitalisations_DateEntree    ON Hospitalisations(DateEntree);
CREATE INDEX IX_Messages_DateEnvoi             ON Messages(DateEnvoi);
CREATE INDEX IX_LogsAcces_DateAction           ON LogsAcces(DateAction);
GO

PRINT 'Base DME_SourceDB créée avec succès.';
GO
