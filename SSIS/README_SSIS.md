# Architecture SSIS Professionnelle — DME_BI
## Projet Business Intelligence Tunisien (style AdventureWorksDW)

> **Cours** : 2 GLID 2025-2026 — Dr. Salma DAMMAK / Dr. Taher Labidi  
> **Niveau** : Architecture industrielle Microsoft BI — SQL Server 2019 + SSIS 2019

---

## 📐 Architecture Globale du Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PIPELINE ETL DME_BI                                 │
│                                                                         │
│  ┌──────────────┐    ┌─────────────┐    ┌─────────────────────────┐   │
│  │  DME_SourceDB│───▶│ DME_Staging │───▶│   DME_DataWarehouse     │   │
│  │  (OLTP)      │    │  (Buffer)   │    │   (Schéma en étoile)    │   │
│  │  22 tables   │    │  11 tables  │    │   9 dims + 4 faits       │   │
│  └──────────────┘    └─────────────┘    └────────────┬────────────┘   │
│                                                       │                 │
│                                              ┌────────▼────────┐       │
│                                              │   Power BI /    │       │
│                                              │   SSAS OLAP     │       │
│                                              └─────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘

SSIS Packages (orchestration) :
  00_Master_ETL.dtsx
    ├── 01_Staging_Extract.dtsx       (OLTP → Staging)
    ├── 02_Load_Dim_Patient.dtsx      (SCD Type 2)
    ├── 03_Load_Dim_Medecin.dtsx      (SCD Type 2)
    ├── 04_Load_Dimensions.dtsx       (SCD Type 1 : Dim_Date + 5 dimensions)
    ├── 05_Load_Fact_Consultation.dtsx
    ├── 06_Load_Facts_Rest.dtsx       (Ordonnance + Analyse + Hospi)
    └── 07_ETL_Audit.dtsx             (Validation + KPIs)
```

---

## 📂 Arborescence des Fichiers

```
SSIS/
├── Packages/                          ← Packages SSIS (.dtsx)
│   ├── 00_Master_ETL.dtsx             ← Orchestrateur principal
│   ├── 01_Staging_Extract.dtsx        ← Extraction OLTP → Staging
│   ├── 02_Load_Dim_Patient.dtsx       ← SCD Type 2 Patient
│   ├── 03_Load_Dim_Medecin.dtsx       ← SCD Type 2 Médecin
│   ├── 04_Load_Dimensions.dtsx        ← Dim_Date + 5 dims SCD1
│   ├── 05_Load_Fact_Consultation.dtsx ← Fact principale (Lookup chain)
│   ├── 06_Load_Facts_Rest.dtsx        ← Ordonnance, Analyse, Hospi
│   └── 07_ETL_Audit.dtsx              ← Validation et KPIs
│
├── SQL/                               ← Scripts SQL de support
│   ├── 01_Create_Staging_Tables.sql   ← Base DME_Staging (stg.* + ctl.*)
│   ├── 02_Create_ETL_Log_Tables.sql   ← Tables de log ETL (log.*)
│   ├── 03_Create_Config_Tables.sql    ← Tables de config (cfg.*)
│   └── 04_SCD_Merge_Scripts.sql       ← Scripts MERGE SCD1 et SCD2
│
├── Config/                            ← Configuration SSIS
│   └── DME_ETL.dtsConfig              ← Fichier de config XML
│
├── Logs/                              ← (créé automatiquement)
│   └── ETL_Master.log                 ← Logs d'exécution (fichier plat)
│
└── README_SSIS.md                     ← Ce fichier
```

---

## 🗄️ Bases de Données du Pipeline

| Base           | Rôle               | Schémas        | Nb Tables |
|----------------|--------------------|----------------|-----------|
| `DME_SourceDB` | Source OLTP        | dbo            | 22        |
| `DME_Staging`  | Zone tampon ETL    | stg, ctl, log, cfg | 20+   |
| `DME_DataWarehouse` | DW Décisionnel | dbo           | 13        |

---

## 📦 Packages SSIS — Détail

### `00_Master_ETL.dtsx` — Orchestrateur

**Rôle** : Chef d'orchestre du pipeline complet.  
**Control Flow** :

```
SCT_Init (log.usp_StartRun → @RunID)
    ↓
EPT_Staging (01_Staging_Extract.dtsx)
    ↓
SEQ_Dimensions
    ├── EPT_DimPatient  (02_Load_Dim_Patient.dtsx)  
    ├── EPT_DimMedecin  (03_Load_Dim_Medecin.dtsx)
    └── EPT_DimOthers   (04_Load_Dimensions.dtsx)
    ↓
SEQ_Facts
    ├── EPT_FactConsultation (05_Load_Fact_Consultation.dtsx)
    └── EPT_FactsRest        (06_Load_Facts_Rest.dtsx)
    ↓
SCT_Finalize (log.usp_EndRun → SUCCES)

OnError → SCT_LogError + SCT_MarkFailed (ECHEC)
```

**Variables clés** :
- `User::RunID` — Identifiant unique de l'exécution
- `User::TypeExecution` — FULL / INCREMENTAL
- `User::Environnement` — DEV / TEST / PROD

---

### `01_Staging_Extract.dtsx` — Extraction OLTP

**Rôle** : Copie brute des données sources vers DME_Staging.  
**Stratégie** : Watermark par table pour le mode INCREMENTAL.

**Data Flow : DFT_Patients**
```
OLE_SRC_Patients (DME_SourceDB: Patients JOIN Utilisateurs)
    ↓
DRV_ETL_Colonnes (ajouter ETL_Lot, ETL_Statut='NOUVEAU')
    ↓
OLE_DST_stgPatient (DME_Staging.stg.Patient)
```

**Data Flow : DFT_Consultations (Incrémental)**
```
OLE_SRC_Consultations (WHERE DateConsultation >= @WM_Consultations)
    ↓
OLE_DST_stgConsultation (DME_Staging.stg.Consultation)
```

---

### `02_Load_Dim_Patient.dtsx` — SCD Type 2 Patient

**Colonnes historisées** : Ville, Gouvernorat, GroupeSanguin, Assurance, Statut  
**Détection de changement** : Hash SHA-256 sur les colonnes surveillées

```
OLE_SRC_stgPatient (avec calcul Age, GroupeAge, HashRecord)
    ↓
LKP_DimPatient (Dim_Patient WHERE EstCourant=1)
    ├── Match → CSP_SCD_Decision
    │   ├── Hash différent → CMD_ExpirerAncienneVersion
    │   │   (UPDATE DateFinValidite=hier, EstCourant=0)
    │   │   → UAL_NouvellesVersions
    │   └── Hash identique → Ignorer
    └── No Match (nouveau) → UAL_NouvellesVersions
              ↓
        DRV_SCD2_Colonnes (DateDebutValidite=aujourd'hui, EstCourant=1)
              ↓
        OLE_DST_DimPatient (INSERT)
```

---

### `03_Load_Dim_Medecin.dtsx` — SCD Type 2 Médecin

**Colonnes historisées** : Specialite, Hopital, AnneesExperience  
**Même logique que `02_Load_Dim_Patient.dtsx`**

---

### `04_Load_Dimensions.dtsx` — Dimensions de référence SCD1

| Tâche | Dimension | Méthode |
|---|---|---|
| `SCT_LoadDimDate` | `Dim_Date` | `EXEC sp_Remplir_Dim_Date` |
| `SCT_MergeGouvernorat` | `Dim_Gouvernorat` | `MERGE` (INSERT + UPDATE) |
| `SCT_MergeSpecialite` | `Dim_Specialite` | `MERGE` |
| `SCT_MergeMedicament` | `Dim_Medicament` | `MERGE` |
| `SCT_MergeTypeAnalyse` | `Dim_TypeAnalyse` | `MERGE` |
| `SCT_MergeHopital` | `Dim_Hopital` | `MERGE` |

---

### `05_Load_Fact_Consultation.dtsx` — Fact principale

**Data Flow avec lookups chaînés** :
```
OLE_SRC (stg.Consultation)
    ↓
LKP_PatientKey  (Dim_Patient, EstCourant=1)
    ↓
LKP_MedecinKey  (Dim_Medecin, EstCourant=1)
    ↓
LKP_DiagnosticKey (Dim_Diagnostic)
    ↓
LKP_HopitalKey  (Dim_Hopital)
    ↓
DRV_FactCols
  • DateKey = YYYYMMDD
  • EstUrgence = (TypeConsultation == "Urgence")
    ↓
OLE_DST_FactConsultation (Fast Load, TABLOCK)

Lignes sans dimension → FF_DST_Errors (CSV)
```

---

### `06_Load_Facts_Rest.dtsx` — 3 autres faits

| Tâche | Fait | Transformations |
|---|---|---|
| `SCT_LoadFactOrdonnance` | `Fact_Ordonnance` | `DureeTrtJours = TRY_CAST(LEFT(DureeTrt, CHARINDEX('jour',...)-1))` |
| `SCT_LoadFactAnalyse` | `Fact_Analyse` | `DelaiResultatJours = DATEDIFF(DAY, DateDemande, DateResultat)` |
| `SCT_LoadFactHospi` | `Fact_Hospitalisation` | UPDATE DateSortie si NULL + INSERT nouvelles |

---

### `07_ETL_Audit.dtsx` — Audit et KPIs

Génère 4 rapports post-ETL :
1. **RowCounts** — Lignes par table DW avec taille en KB
2. **Orphans** — Clés étrangères sans dimension correspondante
3. **Stats** — Top diagnostics, taux anomalies, durée hospitalisations
4. **Summary** — Résumé du run dans `[log].ETL_Run`

---

## 🗂️ Tables de Staging (DME_Staging)

### Schéma `stg` — Copie brute des données OLTP

| Table | Source OLTP | Colonnes ETL |
|---|---|---|
| `stg.Patient` | `Patients + Utilisateurs` | `ETL_Lot, ETL_Statut, ETL_DateExtraction` |
| `stg.Medecin` | `Medecins + Utilisateurs` | idem |
| `stg.Consultation` | `Consultations` | idem |
| `stg.Ordonnance` | `Ordonnances` | idem |
| `stg.DemandeAnalyse` | `DemandesAnalyse` | idem |
| `stg.ResultatAnalyse` | `ResultatsAnalyse` | idem |
| `stg.Hospitalisation` | `Hospitalisations` | idem |
| `stg.Gouvernorat` | `Gouvernorats` | `ETL_Lot` |
| `stg.Hopital` | `Hopitaux` | idem |
| `stg.Specialite` | `Specialites` | idem |
| `stg.Medicament` | `Medicaments` | idem |
| `stg.TypeAnalyse` | `TypesAnalyse` | idem |

### Schéma `ctl` — Contrôle ETL
- **`ctl.Watermark`** — Dernière date chargée par table (chargement incrémental)
- **`ctl.usp_GetWatermark`** / **`ctl.usp_SetWatermark`** — Procédures watermark

---

## 📊 Tables de Log ETL (DME_Staging)

### Schéma `log`

```
log.ETL_Run          ← 1 ligne par exécution complète
    ↑
log.ETL_PackageLog   ← 1 ligne par package SSIS exécuté
    ↑
log.ETL_TaskLog      ← 1 ligne par tâche SSIS
    ↑
log.ETL_ErrorLog     ← Détail des erreurs + lignes rejetées
    ↑
log.ETL_RowCount     ← Compteurs INSERT/UPDATE/DELETE par table
```

**Procédures de log** :
```sql
EXEC [log].usp_StartRun   @TypeExecution='FULL', @RunID OUTPUT
EXEC [log].usp_EndRun     @RunID, @Statut='SUCCES'
EXEC [log].usp_StartPackage @RunID, @NomPackage, @PackageLogID OUTPUT
EXEC [log].usp_LogError   @RunID, @MessageErreur, @Severite='ERREUR'
EXEC [log].usp_LogRowCount @RunID, @NomTable, @Phase, @TypeOperation, @NombreLignes
```

---

## ⚙️ Configuration (cfg.Parametre)

Tous les paramètres ETL sont centralisés :

| Clé | Valeur par défaut | Description |
|---|---|---|
| `SourceDB_Server` | `.` | Serveur SQL OLTP |
| `ETL_TypeExecution` | `FULL` | FULL ou INCREMENTAL |
| `ETL_BatchSize` | `10000` | Lignes par lot SSIS |
| `SCD_Type2_Patient` | `1` | Activer/désactiver SCD2 |
| `DimDate_AnneeDebut` | `2020` | Plage Dim_Date |
| `Alerte_Email_Actif` | `1` | Alertes email (PROD) |

---

## 🔄 Slowly Changing Dimensions

### SCD Type 1 (écrasement)
Appliqué à : `Dim_Gouvernorat`, `Dim_Specialite`, `Dim_Diagnostic`, `Dim_Medicament`, `Dim_Hopital`, `Dim_TypeAnalyse`

```sql
MERGE INTO Dim_Gouvernorat cible
USING stg.Gouvernorat source ON cible.GouvernoratID = source.GouvernoratID
WHEN MATCHED AND (changement détecté) THEN UPDATE ...
WHEN NOT MATCHED THEN INSERT ...
```

### SCD Type 2 (historisation)
Appliqué à : `Dim_Patient`, `Dim_Medecin`

**Colonnes ajoutées** :

| Colonne | Type | Description |
|---|---|---|
| `DateDebutValidite` | DATE | Début de validité de la version |
| `DateFinValidite` | DATE | Fin de validité (NULL = version courante) |
| `EstCourant` | BIT | 1 = version active |
| `HashRecord` | NVARCHAR(64) | SHA-256 des colonnes surveillées |

**Requête pour obtenir le patient courant** :
```sql
SELECT * FROM Dim_Patient WHERE PatientID = 5 AND EstCourant = 1
```

**Requête pour l'historique d'un patient** :
```sql
SELECT PatientID, Ville, Gouvernorat, DateDebutValidite, DateFinValidite
FROM Dim_Patient WHERE PatientID = 5
ORDER BY DateDebutValidite
```

---

## 🚀 Installation et Ordre d'Exécution

### Prérequis
- SQL Server 2019 (Express, Standard ou Enterprise)
- SQL Server Data Tools (SSDT) pour Visual Studio 2019/2022
- SSIS Runtime (Integration Services)

### Étape 1 — Créer les bases OLTP et DW (si pas encore fait)
```
Exécuter dans SSMS dans cet ordre :
1. database/01_DME_SourceDB_Schema.sql
2. database/02_DME_SourceDB_Data.sql
3. database/03_DME_DataWarehouse_Schema.sql
```

### Étape 2 — Créer la base Staging et les tables de log
```
Exécuter dans SSMS dans cet ordre :
4. SSIS/SQL/01_Create_Staging_Tables.sql
5. SSIS/SQL/02_Create_ETL_Log_Tables.sql
6. SSIS/SQL/03_Create_Config_Tables.sql
```

### Étape 3 — Adapter la configuration
```
1. Ouvrir SSIS/Config/DME_ETL.dtsConfig
2. Remplacer ".\SQLEXPRESS" par le nom de ton serveur SQL
3. Adapter les chemins C:\DME_BI\... selon ton environnement
```

### Étape 4 — Ouvrir et exécuter les packages SSIS
```
Option A : SSDT (Visual Studio)
  - Créer un nouveau projet SSIS
  - Importer les fichiers .dtsx depuis SSIS/Packages/
  - Configurer les connexions
  - Exécuter 00_Master_ETL.dtsx

Option B : dtexec (ligne de commande)
  dtexec /F "SSIS\Packages\00_Master_ETL.dtsx" /De "SSIS\Config\DME_ETL.dtsConfig"

Option C : SQL Server Agent
  - Créer un job SQL Agent
  - Ajouter une étape "SQL Server Integration Services Package"
  - Pointer vers 00_Master_ETL.dtsx
  - Planifier selon cfg.PlanningETL
```

---

## 🏗️ Comparaison avec AdventureWorksDW

| Concept AdventureWorks | Équivalent DME_BI |
|---|---|
| `AdventureWorksDW` | `DME_DataWarehouse` |
| `AdventureWorksLT` (source) | `DME_SourceDB` |
| `FactInternetSales` | `Fact_Consultation` |
| `DimCustomer` | `Dim_Patient` |
| `DimEmployee` | `Dim_Medecin` |
| `DimProduct` | `Dim_Medicament` |
| `DimDate` | `Dim_Date` |
| `DimGeography` | `Dim_Gouvernorat` |
| Package `DimCustomer.dtsx` | `02_Load_Dim_Patient.dtsx` |
| Package `FactInternetSales.dtsx` | `05_Load_Fact_Consultation.dtsx` |
| SCD Wizard | Scripts MERGE T-SQL + SSIS SCD Component |
| ProActiveCaching | Watermark + Incrémental |

---

## 📊 Intégration Power BI

### Connexion au Data Warehouse
1. Power BI Desktop → **Obtenir des données** → **SQL Server**
2. Serveur : `.\SQLEXPRESS` (adapter)
3. Base de données : `DME_DataWarehouse`
4. Mode : **Import** (ou DirectQuery pour données en temps réel)

### Requêtes DAX utiles

```dax
// Nombre de consultations par mois
ConsultationsParMois = 
CALCULATE(
    COUNT(Fact_Consultation[ConsultationID]),
    USERELATIONSHIP(Fact_Consultation[DateKey], Dim_Date[DateKey])
)

// Taux d'analyses anormales
TauxAnomalie = 
DIVIDE(
    CALCULATE(COUNTROWS(Fact_Analyse), Fact_Analyse[EstAnormal] = 1),
    COUNTROWS(Fact_Analyse),
    0
)

// Durée moyenne hospitalisation
DureeMoyenneHospi = AVERAGE(Fact_Hospitalisation[DureeSejourJours])

// Coût total hospitalisations par spécialité
CoutParSpecialite = 
CALCULATE(
    SUM(Fact_Hospitalisation[CoutSejour]),
    USERELATIONSHIP(Fact_Hospitalisation[MedecinKey], Dim_Medecin[MedecinKey])
)
```

### Mesures Power BI recommandées
- Consultations par mois/trimestre/année
- Distribution patients par gouvernorat (carte)
- Top 10 diagnostics CIM-10 (barres)
- Taux d'anomalies par type d'analyse (jauge)
- Durée et coût hospitalisations par spécialité (matrice)
- Prescriptions par médicament (treemap)
- Évolution KPIs médicaux sur 4 ans (courbe)

---

## 🔒 Bonnes Pratiques Appliquées

| Pratique | Implémentation |
|---|---|
| **Idempotence** | `NOT EXISTS` + `MERGE` pour éviter les doublons |
| **Isolation** | Staging intermédiaire entre OLTP et DW |
| **Détection de changements** | Hash SHA-256 (SCD2) + Watermark (Incrémental) |
| **Gestion des erreurs** | `OnError` handler + `log.ETL_ErrorLog` |
| **Audit complet** | `log.ETL_Run/PackageLog/TaskLog/RowCount` |
| **Paramétrage** | `cfg.Parametre` + fichier `.dtsConfig` |
| **Rejets de lignes** | Fichier CSV + compteur `NbLignesErreur` |
| **Performance** | Fast Load TABLOCK, cache lookup partial, index DW |
| **Historisation** | SCD Type 2 avec SHA-256 + DateDebutValidite |
| **Planification** | `cfg.PlanningETL` + SQL Server Agent |

---

*Projet DME_BI — Architecture SSIS industrielle inspirée d'AdventureWorksDW*  
*Adapté au domaine médical tunisien — 2 GLID 2025-2026*
