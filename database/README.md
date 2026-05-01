# 🏥 DME Business Intelligence – Base de Données Décisionnelle

> **Projet :** Système Décisionnel – Dossier Médical Électronique Tunisien  
> **Cours :** Business Intelligence – 2 GLID 2025-2026  
> **Enseignants :** Dr. Salma DAMMAK & Dr. Taher Labidi  
> **Institution :** Institut International de Technologie – Sfax

---

## 📋 Table des matières

1. [Architecture globale](#architecture-globale)
2. [Fichiers SQL](#fichiers-sql)
3. [Schéma en étoile](#schéma-en-étoile)
4. [Installation et exécution](#installation-et-exécution)
5. [Requêtes analytiques Power BI](#requêtes-analytiques-power-bi)

---

## 🏗️ Architecture globale

```
┌─────────────────────┐      ┌──────────────────┐      ┌────────────────────────┐
│   DME_SourceDB      │      │   Processus ETL  │      │   DME_DataWarehouse    │
│   (Base OLTP)       │─────▶│  04_ETL_Source   │─────▶│   (Schéma en étoile)  │
│                     │      │  ToDW.sql        │      │                        │
│  • Patients         │      │                  │      │  Dimensions :          │
│  • Médecins         │      │  • Extraction    │      │  • Dim_Date            │
│  • Consultations    │      │  • Transformat.  │      │  • Dim_Patient         │
│  • Ordonnances      │      │  • Chargement    │      │  • Dim_Medecin         │
│  • Analyses         │      │                  │      │  • Dim_Diagnostic      │
│  • Hospitalisations │      └──────────────────┘      │  • Dim_Medicament      │
└─────────────────────┘                                 │  • Dim_TypeAnalyse     │
                                                        │  • Dim_Hopital         │
                                                        │  • Dim_Gouvernorat     │
                                                        │                        │
                                                        │  Faits :               │
                                                        │  • Fact_Consultation   │
                                                        │  • Fact_Ordonnance     │
                                                        │  • Fact_Analyse        │
                                                        │  • Fact_Hospitalisation│
                                                        └────────────────────────┘
                                                                  │
                                                                  ▼
                                                        ┌────────────────────────┐
                                                        │     Cube OLAP          │
                                                        │  (SSAS / Power BI)     │
                                                        └────────────────────────┘
                                                                  │
                                                                  ▼
                                                        ┌────────────────────────┐
                                                        │   Dashboards           │
                                                        │  Power BI / Web        │
                                                        └────────────────────────┘
```

---

## 📁 Fichiers SQL

| # | Fichier | Description | Ordre d'exécution |
|---|---------|-------------|-------------------|
| 1 | `01_DME_SourceDB_Schema.sql` | Création de la base OLTP source `DME_SourceDB` avec toutes les tables | **1er** |
| 2 | `02_DME_SourceDB_Data.sql` | Insertion des données réalistes (2022–2025) | **2ème** |
| 3 | `03_DME_DataWarehouse_Schema.sql` | Création du Data Warehouse `DME_DataWarehouse` (schéma en étoile) | **3ème** |
| 4 | `04_ETL_SourceToDW.sql` | Script ETL complet : peuple le DW depuis la base OLTP | **4ème** |

### Détail des fichiers

#### `01_DME_SourceDB_Schema.sql`
Crée la base OLTP `DME_SourceDB` avec :
- **7 tables de référence** : Gouvernorats, Villes, Spécialités, TypesAnalyse, Médicaments, Diagnostics, Hôpitaux
- **6 tables utilisateurs** : Utilisateurs, Patients, Médecins, Infirmiers, Laboratoires, Admins
- **9 tables métier** : DME, Consultations, Ordonnances, DemandesAnalyse, ResultatsAnalyse, Observations, Hospitalisations, Messages, LogsAcces

#### `02_DME_SourceDB_Data.sql`
Insère des données médicales réalistes couvrant 2022–2025 :
- 8 gouvernorats, 15 villes tunisiennes
- 8 spécialités, 12 types d'analyse, 20 médicaments, 15 diagnostics CIM-10
- 5 hôpitaux, 1 admin, 6 médecins, 3 infirmiers, 2 laboratoires
- **30 patients** avec profils démographiques variés
- **75 consultations**, **58 ordonnances**, **48 demandes d'analyse**
- **37 résultats**, **22 observations**, **12 hospitalisations**
- 15 messages, 30 logs d'accès

#### `03_DME_DataWarehouse_Schema.sql`
Crée le DW `DME_DataWarehouse` avec :
- **9 tables de dimensions** (voir schéma en étoile)
- **4 tables de faits** centrales
- **Procédure stockée** `sp_Remplir_Dim_Date` pour générer la dimension date (2020–2026)

#### `04_ETL_SourceToDW.sql`
Script ETL T-SQL en 4 étapes :
1. Peuplement de `Dim_Date` via `sp_Remplir_Dim_Date`
2. Peuplement des 8 dimensions avec transformations (calcul d'âge, groupes d'âge, niveau d'expérience, région géographique)
3. Peuplement des 4 tables de faits avec jointures multi-dimensions
4. Affichage des statistiques finales et requêtes de validation

---

## ⭐ Schéma en étoile

### Tables de dimensions

| Table | Clé primaire | Description |
|-------|-------------|-------------|
| `Dim_Date` | `DateKey` (YYYYMMDD) | Calendrier complet 2020–2026 avec attributs temporels |
| `Dim_Patient` | `PatientKey` | Données démographiques + groupe d'âge calculé |
| `Dim_Medecin` | `MedecinKey` | Profil médecin + niveau d'expérience (Junior/Senior/Expert) |
| `Dim_Specialite` | `SpecialiteKey` | 8 spécialités médicales |
| `Dim_Diagnostic` | `DiagnosticKey` | 15 diagnostics avec codes CIM-10 |
| `Dim_Medicament` | `MedicamentKey` | 20 médicaments (nom commercial, générique, classe) |
| `Dim_TypeAnalyse` | `TypeAnalyseKey` | 12 types d'analyse médicale |
| `Dim_Hopital` | `HopitalKey` | 5 établissements de santé |
| `Dim_Gouvernorat` | `GouvernoratKey` | 8 gouvernorats avec région (Nord/Centre/Sud/Côtière) |

### Tables de faits

| Table | Mesures clés | Dimensions liées |
|-------|-------------|-----------------|
| `Fact_Consultation` | DuréeMinutes, NombreOrdonnances, NombreAnalyses, EstUrgence | Date, Patient, Médecin, Diagnostic, Hôpital |
| `Fact_Ordonnance` | DureeTrtJours | Date, Patient, Médecin, Médicament, Consultation |
| `Fact_Analyse` | Valeur, EstAnormal, EstUrgent, DelaiResultatJours | DateDemande, DateResultat, Patient, Médecin, TypeAnalyse, Hôpital |
| `Fact_Hospitalisation` | DureeSejourJours, CoutSejour | DateEntree, DateSortie, Patient, Médecin, Diagnostic, Hôpital |

### Diagramme simplifié

```
              Dim_Date
                 │
    Dim_Patient ─┤─ Fact_Consultation ─┬─ Dim_Diagnostic
    Dim_Medecin ─┘         │           └─ Dim_Hopital
                           │
              Dim_Date ────┼──── Fact_Ordonnance ──── Dim_Medicament
                           │
              Dim_Date ────┼──── Fact_Analyse ──── Dim_TypeAnalyse
                           │
              Dim_Date ────┴──── Fact_Hospitalisation
```

### Transformations ETL

| Champ source | Champ DW | Transformation |
|-------------|----------|---------------|
| `DateNaissance` | `Age` | `DATEDIFF(YEAR, DateNaissance, GETDATE())` |
| `Age` | `GroupeAge` | 0-17 / 18-35 / 36-55 / 56-75 / 75+ |
| `AnneesExperience` | `NiveauExperience` | Junior (0-5) / Senior (6-14) / Expert (15+) |
| `Gouvernorat.Nom` | `Region` | Nord / Centre / Sud / Côtière |
| `DureeTrt (texte)` | `DureeTrtJours` | Extraction numérique du texte |
| `DateConsultation` | `DateKey` | YYYYMMDD = YEAR*10000+MONTH*100+DAY |

---

## 🚀 Installation et exécution

### Prérequis
- **Microsoft SQL Server** 2016 ou supérieur (ou SQL Server Express)
- **SQL Server Management Studio (SSMS)** ou Azure Data Studio

### Étapes d'installation

#### 1. Créer la base OLTP source
```sql
-- Ouvrir 01_DME_SourceDB_Schema.sql dans SSMS
-- Exécuter avec F5
-- Résultat attendu : "Base DME_SourceDB créée avec succès."
```

#### 2. Insérer les données
```sql
-- Ouvrir 02_DME_SourceDB_Data.sql dans SSMS
-- Vérifier que vous êtes sur DME_SourceDB
-- Exécuter avec F5
-- Résultat : confirmation avec le nombre d'enregistrements
```

#### 3. Créer le Data Warehouse
```sql
-- Ouvrir 03_DME_DataWarehouse_Schema.sql dans SSMS
-- Exécuter avec F5
-- Résultat : "Base DME_DataWarehouse créée avec succès."
```

#### 4. Exécuter l'ETL
```sql
-- Ouvrir 04_ETL_SourceToDW.sql dans SSMS
-- Exécuter avec F5
-- Résultat : tableau de statistiques avec le nombre de lignes par table
```

### Connexion Power BI
1. Ouvrir Power BI Desktop
2. **Obtenir les données** → SQL Server
3. Serveur : `localhost` (ou nom de votre instance)
4. Base de données : `DME_DataWarehouse`
5. Importer les tables `Fact_*` et `Dim_*`
6. Les relations sont déjà définies via les clés étrangères

---

## 📊 Requêtes analytiques Power BI

### 1. Nombre de consultations par mois/année

```sql
SELECT
    dd.Annee,
    dd.NomMois,
    dd.Mois,
    NombreConsultations = COUNT(*),
    NombreUrgences      = SUM(CAST(fc.EstUrgence AS INT)),
    DureeMoyenne        = AVG(CAST(fc.DureeMinutes AS FLOAT))
FROM Fact_Consultation fc
JOIN Dim_Date dd ON fc.DateKey = dd.DateKey
GROUP BY dd.Annee, dd.Mois, dd.NomMois
ORDER BY dd.Annee, dd.Mois;
```

### 2. Diagnostics les plus fréquents

```sql
SELECT TOP 10
    dd.CodeCIM10,
    dd.Libelle,
    dd.Categorie,
    NombreConsultations = COUNT(*),
    NombreUrgences      = SUM(CAST(fc.EstUrgence AS INT)),
    PourcentageTotal    = CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM Fact_Consultation fc
JOIN Dim_Diagnostic dd ON fc.DiagnosticKey = dd.DiagnosticKey
GROUP BY dd.CodeCIM10, dd.Libelle, dd.Categorie
ORDER BY NombreConsultations DESC;
```

### 3. Répartition des patients par gouvernorat

```sql
SELECT
    dp.Gouvernorat,
    dg.Region,
    NombrePatients       = COUNT(DISTINCT dp.PatientID),
    NombreConsultations  = COUNT(*),
    NombreFemmes         = SUM(CASE WHEN dp.Sexe = 'F' THEN 1 ELSE 0 END),
    NombreHommes         = SUM(CASE WHEN dp.Sexe = 'M' THEN 1 ELSE 0 END)
FROM Fact_Consultation fc
JOIN Dim_Patient dp ON fc.PatientKey = dp.PatientKey
JOIN Dim_Gouvernorat dg ON dp.Gouvernorat = dg.Nom
GROUP BY dp.Gouvernorat, dg.Region
ORDER BY NombreConsultations DESC;
```

### 4. Taux d'analyses anormales par type

```sql
SELECT
    ta.Nom              AS TypeAnalyse,
    ta.Unite,
    TotalAnalyses       = COUNT(*),
    AnalysesAnormales   = SUM(CAST(fa.EstAnormal AS INT)),
    TauxAnormalite      = CAST(
        SUM(CAST(fa.EstAnormal AS INT)) * 100.0 / NULLIF(COUNT(*), 0)
        AS DECIMAL(5,1)
    ),
    ValeurMoyenne       = CAST(AVG(fa.Valeur) AS DECIMAL(10,3)),
    DelaiMoyenJours     = CAST(AVG(CAST(fa.DelaiResultatJours AS FLOAT)) AS DECIMAL(4,1))
FROM Fact_Analyse fa
JOIN Dim_TypeAnalyse ta ON fa.TypeAnalyseKey = ta.TypeAnalyseKey
WHERE fa.Valeur IS NOT NULL
GROUP BY ta.Nom, ta.Unite
ORDER BY TauxAnormalite DESC;
```

### 5. Durée moyenne d'hospitalisation par spécialité

```sql
SELECT
    dm.Specialite,
    NombreHospitalisations  = COUNT(*),
    DureeMoyenneJours       = CAST(AVG(CAST(fh.DureeSejourJours AS FLOAT)) AS DECIMAL(5,1)),
    DureeMinJours           = MIN(fh.DureeSejourJours),
    DureeMaxJours           = MAX(fh.DureeSejourJours),
    CoutMoyen               = CAST(AVG(fh.CoutSejour) AS DECIMAL(10,2)),
    CoutTotal               = SUM(fh.CoutSejour)
FROM Fact_Hospitalisation fh
JOIN Dim_Medecin dm ON fh.MedecinKey = dm.MedecinKey
WHERE fh.DureeSejourJours IS NOT NULL
GROUP BY dm.Specialite
ORDER BY DureeMoyenneJours DESC;
```

### 6. Top médicaments prescrits

```sql
SELECT TOP 10
    dm.NomCommercial,
    dm.NomGenerique,
    dm.Classe,
    NombrePrescriptions     = COUNT(*),
    NombrePatientsDifferents = COUNT(DISTINCT fo.PatientKey),
    DureeMoyenneJours       = CAST(AVG(CAST(fo.DureeTrtJours AS FLOAT)) AS DECIMAL(5,1)),
    PourcentageTotal        = CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,2))
FROM Fact_Ordonnance fo
JOIN Dim_Medicament dm ON fo.MedicamentKey = dm.MedicamentKey
GROUP BY dm.NomCommercial, dm.NomGenerique, dm.Classe
ORDER BY NombrePrescriptions DESC;
```

### 7. Évolution temporelle des hospitalisations (Power BI - Graphique en courbes)

```sql
SELECT
    dd.Annee,
    dd.Trimestre,
    NombreHospitalisations  = COUNT(*),
    DureeMoyenneJours       = CAST(AVG(CAST(fh.DureeSejourJours AS FLOAT)) AS DECIMAL(5,1)),
    CoutTotal               = SUM(fh.CoutSejour),
    TauxUrgences            = CAST(
        SUM(CASE WHEN fc.EstUrgence = 1 THEN 1 ELSE 0 END) * 100.0
        / NULLIF(COUNT(*), 0) AS DECIMAL(5,1)
    )
FROM Fact_Hospitalisation fh
JOIN Dim_Date dd ON fh.DateEntreeKey = dd.DateKey
JOIN Dim_Medecin dm ON fh.MedecinKey = dm.MedecinKey
LEFT JOIN Fact_Consultation fc ON fh.PatientKey = fc.PatientKey
    AND fh.DateEntreeKey = fc.DateKey
GROUP BY dd.Annee, dd.Trimestre
ORDER BY dd.Annee, dd.Trimestre;
```

### 8. Tableau de bord – Vue d'ensemble (KPIs)

```sql
SELECT
    TotalPatients           = (SELECT COUNT(*) FROM Dim_Patient),
    TotalConsultations      = (SELECT COUNT(*) FROM Fact_Consultation),
    TotalUrgences           = (SELECT SUM(CAST(EstUrgence AS INT)) FROM Fact_Consultation),
    TotalOrdonnances        = (SELECT COUNT(*) FROM Fact_Ordonnance),
    TotalAnalyses           = (SELECT COUNT(*) FROM Fact_Analyse),
    TauxAnalysesAnormales   = (
        SELECT CAST(SUM(CAST(EstAnormal AS INT)) * 100.0 / NULLIF(COUNT(*),0) AS DECIMAL(5,1))
        FROM Fact_Analyse WHERE Valeur IS NOT NULL
    ),
    TotalHospitalisations   = (SELECT COUNT(*) FROM Fact_Hospitalisation),
    CoutTotalHospitalisations = (SELECT SUM(CoutSejour) FROM Fact_Hospitalisation),
    DureeMoyenneHospitalisation = (
        SELECT CAST(AVG(CAST(DureeSejourJours AS FLOAT)) AS DECIMAL(5,1))
        FROM Fact_Hospitalisation WHERE DureeSejourJours IS NOT NULL
    );
```

---

## 🔧 Structure des bases de données

### DME_SourceDB (Base OLTP)
```
Tables de référence (7)     Tables utilisateurs (6)     Tables métier (9)
─────────────────────────   ───────────────────────     ─────────────────────────────
Gouvernorats                Utilisateurs                DME
Villes                      Patients                    Consultations
Specialites                 Medecins                    Ordonnances
TypesAnalyse                Infirmiers                  DemandesAnalyse
Medicaments                 Laboratoires                ResultatsAnalyse
Diagnostics                 Admins                      Observations
Hopitaux                                                Hospitalisations
                                                        Messages
                                                        LogsAcces
```

### DME_DataWarehouse (Base OLAP)
```
Dimensions (9)              Faits (4)
─────────────────────────   ─────────────────────
Dim_Date                    Fact_Consultation
Dim_Patient                 Fact_Ordonnance
Dim_Medecin                 Fact_Analyse
Dim_Specialite              Fact_Hospitalisation
Dim_Diagnostic
Dim_Medicament
Dim_TypeAnalyse
Dim_Hopital
Dim_Gouvernorat
```

---

## 📈 Suggestions de visualisations Power BI

| Visualisation | Type de graphique | Données |
|--------------|------------------|---------|
| Consultations par mois | Histogramme | Fact_Consultation × Dim_Date |
| Carte des patients | Carte géographique | Dim_Patient × Dim_Gouvernorat |
| Top diagnostics | Graphique à barres | Fact_Consultation × Dim_Diagnostic |
| Évolution HbA1c | Courbes temporelles | Fact_Analyse × Dim_Date |
| Coûts hospitalisations | Treemap | Fact_Hospitalisation × Dim_Hopital |
| Prescriptions médicaments | Nuage de mots | Fact_Ordonnance × Dim_Medicament |
| KPIs généraux | Cartes Power BI | Toutes tables de faits |
| Pyramide des âges | Graphique pyramidal | Dim_Patient |

---

*Documentation générée pour le projet Business Intelligence – 2 GLID 2025-2026*
