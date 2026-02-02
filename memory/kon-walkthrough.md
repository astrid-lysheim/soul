# Kon Pipeline — Full Walkthrough Notes

*Compiled 2026-01-30 by Astrid for José*

---

## The Story

Inherited an 800-line R monolith processing 10M+ records across 3 datasets (CLIE, POLA, HFAC) with ~240 features. No MLOps, no tests, no separation of concerns. Couldn't even access the original VM.

- **Phase 1 (José):** Migrated R → Python, config-driven, modular
- **Phase 2 (DE team):** Took over initial ETL
- **Phase 3 (José):** Deployed on SageMaker Pipelines with MLflow tracking
- **Phase 4 (Caleb's vision):** "Best practices" refactor — mostly scaffolding, never completed

---

## 1. Terraform — Infrastructure as Code (~350 lines)

**Location:** `deployment/terraform/`

Provisions the full AWS environment:

- **IAM:** SageMaker execution role with S3, ECR, MLflow policies. Assumed by `sagemaker.amazonaws.com` + `events.amazonaws.com`
- **S3:** Two buckets — `pipeline-data` (data + artifacts) and `mlflow-artifacts`. Versioning + AES256 encryption
- **ECR:** Docker image registry. Scan-on-push, lifecycle policy (keep last 10 images)
- **SageMaker:** Domain + User Profile + Code Editor Space (ml.t3.medium, 30GB EBS)
- **MLflow:** SageMaker-managed tracking server, serverless, auto model registration
- **S3 Upload:** Syncs `src/` + config to S3 for Code Editor access

**Key details:** Region eu-west-1, remote state in S3, multi-environment via variables, tagged for cost tracking.

**One-liner:** *"We defined the entire AWS infrastructure as code — IAM roles, S3 buckets, ECR registry, SageMaker Studio domain, and an MLflow tracking server. All parameterized per environment, state stored remotely, deployed via GitHub Actions."*

---

## 2. Drift Detection (~600 lines)

**Location:** `src/core/drift.py` + `src/entrypoints/drift_check.py`

Detects whether incoming data has shifted from what the model was trained on.

### Three Statistical Tests:

1. **PSI (Population Stability Index)** — primary metric
   - Compares distribution shape (reference vs current)
   - Numeric: quantile bins → compare proportions
   - Categorical: compare category proportions
   - Thresholds: <0.1 none | 0.1–0.25 moderate | >0.25 significant

2. **KS Test (Kolmogorov-Smirnov)** — numeric features
   - Tests if two samples come from same distribution
   - p-value < 0.05 = significant drift

3. **Chi-squared Test** — categorical features
   - Contingency table approach
   - p-value < 0.05 = significant drift

### Classification Logic:
```
PSI > 0.25                     → HIGH
PSI 0.1–0.25 + p-value < 0.05 → MODERATE
PSI 0.1–0.25 + p-value > 0.05 → LOW
PSI < 0.1                     → NONE
```

### Output:
- DriftReport: features analyzed, drift counts, severity distribution, top 10 drifted features
- Overall drift flag: triggers if >10% features drift OR prediction drift is high
- Prediction drift (checks model output probabilities separately)
- JSON report + human-readable summary + optional MLflow logging

### Pipeline Position:
`PreprocessSplit → [DRIFT CHECK] → TrainDomestic/Industrial → InferenceReporting`

Has `--fail-on-drift` flag to halt pipeline if drift is too severe.

**One-liner:** *"We added drift detection using PSI, KS, and chi-squared tests. It auto-detects feature types, generates severity reports, can gate the pipeline, and logs everything to MLflow."*

---

## 3. CI/CD via GitHub Actions (2 workflows)

**Location:** `.github/workflows/`

### Workflow 1: Build and Push Docker Image
- **Triggers:** Push to `dev/segmentation-model` (src/pyproject/Dockerfile changes) OR manual dispatch
- **Steps:** Checkout → AWS OIDC auth → ECR login → Build Docker image → Tag with git SHA + latest → Push to ECR
- **Runner:** Self-hosted `awsmexdevops-builder-container` (Kyndryl infra)
- **Security:** OIDC role assumption — no stored access keys

### Workflow 2: Deploy SageMaker Infrastructure
- **Triggers:** Push to `dev/segmentation-model-infra` (terraform changes) OR manual dispatch
- **Steps:** Checkout → AWS OIDC auth → Terraform init → fmt check → validate → plan → apply
- **Environments:** dev/staging/prod (manual dispatch selects)
- **Actions:** plan / apply / destroy
- **⚠️ Note:** Prod apply uses `-auto-approve` despite comment saying "requires manual review" — gap to address

**One-liner:** *"Two GHA workflows: one builds and pushes Docker images to ECR on every code change (tagged with git SHA), the other deploys infrastructure via Terraform with plan→apply stages. Both use OIDC auth on self-hosted runners."*

---

## 4. Testing (~4,600 lines, 230 tests)

**Location:** `tests/`

### Core Tests — 224 tests across 7 modules:

| Module | Tests | Covers |
|--------|-------|--------|
| test_utils.py | 58 | Helpers, data types, date parsing, column ops |
| test_drift.py | 35 | PSI, KS, chi², severity, report generation |
| test_clustering.py | 29 | Estrato assignment, cluster grouping, segmentation |
| test_feature_engineering.py | 27 | Feature derivation, column transforms, 240-feature pipeline |
| test_modeling.py | 26 | XGBoost training, hyperparams, predictions, serialization |
| test_config.py | 24 | Config loading, validation, frozen dataclasses, errors |
| test_reporting.py | 19 | Report generation, formatting, file creation |

### Integration Tests — 6 tests:
- Run actual entrypoints as subprocesses against sampled real data
- Balanced class sampling (500 train / 200 test per class)
- 5-minute timeout, verify output schemas + file creation

### Quality:
- Shared fixtures via `conftest.py`
- Edge cases (empty inputs, invalid data, missing keys)
- Type checking, frozen immutability
- Reproducible data (`numpy.random.seed()`)

### ⚠️ Empty scaffolding (Caleb's):
- `tests/unit/test_data.py`, `test_features.py`, `test_models.py` — one-line comments only
- `tests/fixtures/sample_data.py` — empty
- If asked: "Real unit tests are in `tests/core/`; the `unit/` directory was part of a planned restructure"

**One-liner:** *"230 tests across unit and integration levels covering every core module — config, feature engineering, modeling, clustering, reporting, utils, and drift. Integration tests run full entrypoints e2e against sampled production data."*

---

## Honest Inventory

### ✅ Real & Working:
- Core pipeline (R → Python migration — the hard work)
- Drift detection module (new, functional, ~600 lines)
- Terraform IaC (~350 lines)
- CI/CD via GitHub Actions (2 workflows)
- Test suite (230 tests, ~4,600 lines)
- SageMaker Pipeline orchestration

### 🔴 Incomplete / Scaffolding:
- `src_old/` — 17 empty Python files (one-line comments)
- `tests/unit/` — 3 empty test files
- YAML configs — never migrated from JSON (base.yaml, dev.yaml, prod.yaml are comments only)
- `pipeline_definition.py` still references `sagemaker_cloudfirst/entrypoints/` paths
- Error messages still say "Cloudfirst"

### 🎯 Quick Wins to Fix:
- Replace cloudfirst references in pipeline_definition.py
- Delete or populate src_old/ (don't leave empty files)
- Either migrate to YAML configs or remove the empty ones
