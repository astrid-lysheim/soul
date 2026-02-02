# Kon/Kyndryl Pipeline Implementation Comparison

## Date: 2025-07-17
## Purpose: José's work presentation prep

---

## TL;DR

**The core ML logic (`src/core/`) in segmentation_model is a byte-for-byte copy of cloudfirst's `sagemaker_cloudfirst/core/`.** The entrypoints are also identical except for import paths (`from sagemaker_cloudfirst.core` → `from src.core`). The actual new work in segmentation_model is:

1. **Drift detection module** (`src/core/drift.py` + `src/entrypoints/drift_check.py`) — ~400 lines of real, functional code
2. **Pipeline definition update** — adds drift check step + parameters
3. **Terraform IaC** — full AWS infrastructure (SageMaker domain, ECR, S3, MLflow, IAM)
4. **GitHub Actions CI/CD** — Docker build/push + Terraform deploy workflows
5. **Tests** — comprehensive unit + integration tests for all core modules
6. **`src_old/` directory** — 100% empty scaffolding (Caleb's AI slop)

---

## 1. Repository Structure Comparison

### cloudfirst (original)
```
cloudfirst/
├── Dockerfile
├── requirements.txt
├── run_pipeline.ipynb
├── docs/
├── CloudWatchLogs/
└── sagemaker_cloudfirst/
    ├── config/default_config.json
    ├── core/
    │   ├── clustering.py
    │   ├── config.py
    │   ├── feature_engineering.py
    │   ├── modeling.py
    │   ├── reporting.py
    │   └── utils.py
    ├── entrypoints/
    │   ├── preprocess_split.py
    │   ├── train_model.py
    │   └── inference_reporting.py
    └── pipeline_definition.py
```

### segmentation_model (new)
```
segmentation_model/
├── pyproject.toml (replaces requirements.txt)
├── main.py (stub: just prints "Hello")
├── configs/ (base.yaml, dev.yaml, prod.yaml — ALL EMPTY, just comments)
├── notebooks/ (empty README placeholders)
├── deployment/
│   ├── docker/Dockerfile
│   └── terraform/ (full IaC)
├── .github/workflows/ (CI/CD)
├── src/
│   ├── config/default_config.json (IDENTICAL to cloudfirst)
│   ├── core/ (IDENTICAL to cloudfirst except imports + drift.py added)
│   ├── entrypoints/ (IDENTICAL except imports + drift_check.py added)
│   └── pipeline_definition.py (cloudfirst + drift step)
├── src_old/ (EMPTY scaffolding)
├── tests/ (comprehensive, real tests)
└── output/ (test artifacts)
```

---

## 2. Entrypoints Comparison

### 2.1 preprocess_split.py
- **cloudfirst**: imports `from sagemaker_cloudfirst.core`
- **segmentation_model**: imports `from src.core`
- **Everything else**: IDENTICAL, line-for-line

### 2.2 train_model.py
- **Difference**: Only import path (`sagemaker_cloudfirst.core` → `src.core`)
- **Everything else**: IDENTICAL — same argparse, same MLflow integration, same artifact writing

### 2.3 inference_reporting.py
- **Difference**: Only import path
- **Everything else**: IDENTICAL — same tarball extraction, same model loading, same clustering, same reporting

### 2.4 drift_check.py (NEW in segmentation_model)
- **~200 lines** of real entrypoint code
- Takes `--reference-path`, `--current-path`, `--output-path`, `--execution-date`
- Supports `--model-type both/Domestic/Industrial`
- Supports `--fail-on-drift` flag to halt pipeline
- Generates JSON report + human-readable .txt summary per model type
- Writes pipeline-readable `drift_summary.json` (for SageMaker PropertyFile)
- Optional MLflow logging of drift metrics
- **This is genuinely new functionality**, not copied from cloudfirst

---

## 3. Core Modules Comparison

### 3.1 config.py — IDENTICAL
Both use frozen dataclasses (`AppConfig`, `ModelingConfig`, `ClusteringConfig`, `ColumnsConfig`) with JSON loading. Same helper functions `_as_str_list`, `_as_int_list`, `load_config_json`. Zero differences.

### 3.2 clustering.py — IDENTICAL
`create_clusters()` and `handle_incorrientes()` — same quantile-based risk categorization, same estrato classification, same tarifa domestic/industrial split. Zero differences.

### 3.3 feature_engineering.py — IDENTICAL
`add_invoice_columns()`, `normalize_dates_relative_to_invoice()`, `preprocess_data()` — same invoice averaging, same date normalization (relative strategy), same cyclical rejection. Zero differences.

### 3.4 modeling.py — IDENTICAL
`train_model()`, `save_predictions_local()`, `save_roc_curve_local()`, `save_feature_importance_local()`, `save_model_artifacts_local()` — same XGBoost config, same artifact writing. Zero differences.

### 3.5 reporting.py — IDENTICAL
`generate_output_files()` — same output columns, same parquet partitioning, same BENCHMARK aggregation. Zero differences.

### 3.6 utils.py — IDENTICAL
Same structured JSON logging, same `RunContextFilter`, same `JsonFormatter`, same memory sampling, same SageMaker context extraction, same `log_time` context manager, same `normalize_string_columns`, same `ensure_dir`. ~300 lines. Zero differences.

### 3.7 drift.py — NEW (segmentation_model only)
**~400 lines of genuine, functional drift detection code.**
- `calculate_psi()` — Population Stability Index for numeric features (quantile binning)
- `calculate_psi_categorical()` — PSI for categorical features
- `ks_test()` — Kolmogorov-Smirnov 2-sample test
- `chi2_test()` — Chi-squared contingency test
- `classify_drift_severity()` — none/low/moderate/high based on PSI + p-value
- `detect_feature_drift()` — Auto-detects numeric vs categorical columns, runs PSI + KS/chi2 on each
- `detect_prediction_drift()` — PSI + KS on model output probabilities
- `generate_drift_report()` — Full report with summary, feature list, prediction drift, overall assessment
- `log_drift_to_mlflow()` — MLflow integration for drift tracking
- Proper dataclasses: `FeatureDrift`, `DriftReport` with JSON serialization
- Industry-standard thresholds: PSI < 0.1 (no drift), 0.1-0.25 (moderate), > 0.25 (significant)

**Assessment: This is real, well-structured code.** Uses scipy.stats, proper statistical tests, clean separation of concerns. Not scaffolding.

---

## 4. Pipeline Definition Comparison

### cloudfirst
4 steps: `PreprocessSplit` → `TrainDomestic` / `TrainIndustrial` → `InferenceReporting`
14 parameters.

### segmentation_model
**5 steps**: `PreprocessSplit` → `DriftCheck` → `TrainDomestic` / `TrainIndustrial` → `InferenceReporting`

New parameters:
- `BaselineFeaturesUri` — S3 path to baseline features (empty = skip)
- `DriftThreshold` — PSI threshold (default 0.25)
- `FailOnDrift` — Gate flag (default "false")

The drift check step:
- Runs after preprocessing, before training
- Uses PropertyFile for pipeline-readable output
- Has `depends_on` preprocess step
- Passes MLflow tracking URI via environment variables
- **Note**: imports still reference `sagemaker_cloudfirst/entrypoints/` paths in the `code=` argument, which is a bug/oversight — should be `src/entrypoints/`

**Everything else in pipeline_definition.py is identical** to cloudfirst.

---

## 5. src_old/ — "Caleb's AI Slop" Assessment

### Structure
```
src_old/
├── data/      (ingestion.py, preprocessing.py, splitting.py, validation.py)
├── features/  (engineering.py, selectors.py, transformers.py)
├── models/    (base.py, evaluation.py, inference.py, registry.py, training.py)
├── pipelines/ (inference.py, training.py)
└── utils/     (config.py, logging.py, metrics.py, monitoring.py)
```

### Reality
**Every single .py file contains ONLY a one-line comment.** Examples:
- `data/ingestion.py`: `# Data ingestion and loading functionality`
- `models/training.py`: `# Model training logic`
- `utils/monitoring.py`: `# Model monitoring and drift detection`
- `features/transformers.py`: `# Custom feature transformers`

**No code whatsoever.** All `__init__.py` files contain just a module-level comment like `# Data processing module`.

### README_NEW_STRUCTURE.md
This file describes the **intended** structure that src_old was supposed to implement. It's a "matriz documentación" approach — plan the structure first, fill in later. The README lists recommended migration order, development commands, etc.

### Verdict
`src_old/` is pure scaffolding — a directory tree with empty files. It represents an aspirational restructuring plan that was never implemented. The README describes migrating cloudfirst → new structure module-by-module, but zero migration actually happened in src_old/.

The **actual** working code is in `src/` (which is just cloudfirst's code with changed import paths + drift module added).

---

## 6. Tests Assessment

### Test Files That ARE Real (tests/core/)
All tests in `tests/core/` are **genuine, comprehensive tests**:

| File | Lines | Tests | Coverage |
|------|-------|-------|----------|
| `test_config.py` | ~150 | 16 tests | load_config_json, _as_str_list, _as_int_list, edge cases |
| `test_clustering.py` | ~350 | 18+ tests | create_clusters, handle_incorrientes, edge cases, config-driven behavior |
| `test_feature_engineering.py` | ~250 | 20+ tests | add_invoice_columns, normalize_dates, preprocess_data, real data integration |
| `test_modeling.py` | ~300 | 15+ tests | train_model, save_predictions, save_roc, save_importance, save_artifacts |
| `test_reporting.py` | ~300 | 15+ tests | generate_output_files, BENCHMARK mode, error handling, edge cases |
| `test_utils.py` | ~400 | 30+ tests | logging setup, global context, memory, SageMaker context, normalize_string |
| `test_drift.py` | ~350 | 25+ tests | PSI, KS, chi2, severity classification, full report, edge cases |

**These are real, well-written tests.** They:
- Use pytest fixtures properly
- Test edge cases (empty DataFrames, single class, NaN handling)
- Include integration tests with real sampled data (parquet fixtures)
- Verify business logic (Cat_And ≤12 months = "Cliente Nuevo")
- Test error handling (missing columns, invalid JSON)
- Have proper assertions (not just "it doesn't crash")

### Test Files That ARE Real (tests/integration/)
`test_pipeline.py` (~350 lines) is a genuine integration test:
- `TestTrainModelIntegration` — runs train_model entrypoint as subprocess, verifies model.pickle and metadata
- `TestInferenceReportingIntegration` — runs inference with trained models, verifies output files
- `TestFullPipelineIntegration` — chains preprocess → train × 2 → inference, marked `@pytest.mark.slow`
- Creates proper fixtures from real preprocessing output or synthetic data
- Handles model creation with `enable_categorical=True` matching production config

### Test Files That ARE Empty (tests/unit/)
- `test_data.py`: `# Unit tests for data module`
- `test_features.py`: `# Unit tests for features module`
- `test_models.py`: `# Unit tests for models module`

These correspond to the empty `src_old/` modules. Since those modules have no code, these tests have no code.

### Test Fixtures
Real `.parquet` files exist in `tests/fixtures/`:
- `sample_cluster_raw.parquet` — 100 rows, 241 columns of real pipeline data
- `minimal_sample.parquet` — subset for quick tests
- `train_sample.parquet`, `test_sample.parquet`, `test_context_sample.parquet` — training/test data
- `sample_data.py` — fixture generation helper

### conftest.py
Proper shared fixtures: `temp_dir`, `sample_config_dict`, `sample_config_file`, `sample_config_dir`.

---

## 7. Config System

### cloudfirst
- Single `default_config.json` with modeling/clustering/columns sections
- Loaded via `load_config_json()` (handles file or directory path)
- Frozen dataclasses for type safety
- `requirements.txt` for dependencies

### segmentation_model
- **Same** `default_config.json` (identical content)
- **Same** config loading code
- **Added**: `configs/` directory with `base.yaml`, `dev.yaml`, `prod.yaml` — but ALL ARE EMPTY (just `# Base configuration` comments)
- `pyproject.toml` replaces `requirements.txt` (modern Python packaging)

The YAML configs are aspirational — the pipeline still uses the JSON config exclusively.

---

## 8. Infrastructure (NEW in segmentation_model)

### Terraform (`deployment/terraform/`)
**~350 lines of real Terraform** provisioning:
- **IAM**: SageMaker execution role with S3, ECR, MLflow permissions
- **S3**: Two buckets (pipeline-data, mlflow-artifacts) with versioning + encryption
- **ECR**: Container registry with lifecycle policy (keep last 10 images)
- **SageMaker Domain**: Studio domain with IAM auth
- **SageMaker User Profile**: Default user
- **SageMaker Space**: Code Editor with configurable instance type + EBS
- **MLflow Tracking Server**: SageMaker-managed serverless instance
- **S3 Upload**: Source code synced to S3

Multi-environment support via `environments/` tfvars (dev, staging, prod).
Backend configured for S3 state with encryption.

### GitHub Actions
Two workflows:
1. **build_push_image.yml** — Builds Docker image, pushes to ECR (triggered on push to `dev/segmentation-model` branch or manual dispatch)
2. **deploy_sagemaker_infrastructure.yml** — Terraform plan/apply/destroy (triggered on push to `dev/segmentation-model-infra` or manual dispatch, with environment selection)

Both use OIDC role assumption (`aws-actions/configure-aws-credentials`) and self-hosted runners (`awsmexdevops-builder-container`).

### Dockerfile
Moved from root to `deployment/docker/Dockerfile`. Changed from `requirements.txt` to `pyproject.toml` install. Otherwise same base image (python:3.11-slim) and SageMaker env vars.

---

## 9. What's Genuine vs. AI-Generated Scaffolding

### Genuine Implementation ✅
| Component | Evidence |
|-----------|----------|
| `src/core/drift.py` | 400 lines of working drift detection with scipy, proper PSI/KS/chi2 |
| `src/entrypoints/drift_check.py` | 200 lines of working entrypoint with argparse, MLflow, summary generation |
| `src/pipeline_definition.py` (drift additions) | Proper SageMaker step integration with PropertyFile |
| `deployment/terraform/` | 350+ lines of production Terraform with real resource definitions |
| `.github/workflows/` | Working CI/CD with OIDC auth, multi-environment support |
| `tests/core/` | 1500+ lines of genuine pytest tests with proper assertions |
| `tests/integration/` | 350+ lines of subprocess-based integration tests |
| `tests/conftest.py` | Proper fixture management |
| `deployment/docker/Dockerfile` | Adapted for pyproject.toml |

### Copied from cloudfirst (no changes except imports) 📋
| Component | Status |
|-----------|--------|
| `src/core/config.py` | Identical |
| `src/core/clustering.py` | Identical |
| `src/core/feature_engineering.py` | Identical |
| `src/core/modeling.py` | Identical |
| `src/core/reporting.py` | Identical |
| `src/core/utils.py` | Identical |
| `src/entrypoints/preprocess_split.py` | Import path only |
| `src/entrypoints/train_model.py` | Import path only |
| `src/entrypoints/inference_reporting.py` | Import path only |
| `src/config/default_config.json` | Identical |

### AI-Generated Scaffolding / Empty 🤖
| Component | Content |
|-----------|---------|
| `src_old/` (all 17 .py files) | One-line comments only |
| `tests/unit/test_data.py` | One-line comment |
| `tests/unit/test_features.py` | One-line comment |
| `tests/unit/test_models.py` | One-line comment |
| `configs/base.yaml` | Comment only |
| `configs/dev.yaml` | Comment only |
| `configs/prod.yaml` | Comment only |
| `README_NEW_STRUCTURE.md` | Aspirational structure doc |
| `main.py` | `print("Hello")` stub |
| `notebooks/` | README placeholders only |

---

## 10. Notable Issues / Observations

1. **Import path bug in pipeline_definition.py**: The segmentation_model's pipeline definition still references `sagemaker_cloudfirst/entrypoints/` in the `code=` argument. This should be `src/entrypoints/` but would break the pipeline because SageMaker copies the code to a processing container.

2. **The error message in preprocess_split.py still says "Cloudfirst"**: The cyclical strategy error message says "intentionally unsupported in Cloudfirst" — wasn't updated for segmentation_model.

3. **The utils.py docstring still says "Cloud-first logging"** in `setup_logging()`.

4. **No migration from cloudfirst actually happened** — the code was simply copied with changed imports. The `src_old/` restructuring was planned but never executed.

5. **The tests are good but test the copied code** — they validate that the cloudfirst logic works correctly, but there's no "parity test" comparing cloudfirst output vs segmentation_model output with the same inputs.

6. **The drift module is the only genuinely new ML functionality**. Everything else is infrastructure/DevOps (Terraform, CI/CD, Docker) or testing.

7. **Output artifacts exist** in `output/` directory — actual parquet files from test runs dated 2026-01-27, suggesting the pipeline was tested end-to-end locally.

---

## 11. Summary for Presentation

**What cloudfirst provides (José's work):**
- Complete ML pipeline: preprocessing → feature engineering → XGBoost training → inference → clustering → reporting
- Production-grade structured JSON logging with memory sampling
- SageMaker pipeline definition with Estimator-based training
- Robust error handling, fail-fast semantics, tarball model extraction
- MLflow integration for experiment tracking

**What segmentation_model adds (Caleb's contribution):**
- ✅ Drift detection (PSI, KS, Chi2) — real, working code
- ✅ Infrastructure as Code (Terraform) — full AWS provisioning
- ✅ CI/CD (GitHub Actions) — Docker + Terraform automation
- ✅ Comprehensive test suite — good coverage of core logic
- ❌ src_old restructuring — empty scaffolding, never implemented
- ❌ YAML configs — empty files
- 📋 Everything else — copied from cloudfirst with import path changes
