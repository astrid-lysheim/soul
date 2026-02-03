# Caleb Meeting — February 3, 2026

## Context
Meeting with Caleb Aguilar (Kyndryl mentor) about the segmentation model project.

## Asks from Caleb

### 1. S3 Metrics Logs — STILL PENDING
Weekly metric logs exported to S3 as TXT files (in addition to MLflow). Easier to consume than MLflow for some stakeholders.
**Status:** TODO — will use existing S3 bucket (no new Terraform needed)

### 2. ~~Refactorization + Config Changes~~ — NEGOTIATED OUT ✅
Originally would have required Terraform changes to add new S3 bucket + config restructuring.
**Outcome:** José negotiated this away. Using existing infrastructure.

### 3. Screenshots in Documentation
Step-by-step visual guides for manual pipeline execution. Click-by-click with status indicators.
- Caleb acknowledges screenshots get outdated (Windows Vista example)
- Philosophy: "just do it for the moment" — documentation should be living but practically isn't
**Status:** TODO

### 4. Full Orchestration Understanding
Caleb asked if José understands end-to-end flow. José was honest: knows his part but not downstream (valor cliente model). Caleb hasn't shared that repo.
**Action:** Get the valor cliente repo to understand where segmentation output goes.

## Architecture Summary

```
SGC System (unknown tech: Pascal? C? .NET?) 
    → SFTP 
    → AWS Transfer Family (SFTP Connector, pay-per-use = cheap)
    → S3 Bronze Layer 
    → Decompress to temp S3
    → Step Function triggers SageMaker Pipeline
    → MLflow tracks metrics
    → [OUTPUT] → Valor Cliente model (downstream, different repo)
```

- **Schedule:** Tuesdays 9 AM for segmentation
- **MLflow server:** Needs to be running before pipeline. Either Step Function starts it as step 1, or separate 8 AM alarm wakes it up first.

## Secrets Strategy
- AWS secrets must be created by Kyndryl España (not José)
- Plan: Collect ALL needed secrets, send in one batch (not one-by-one weekly)
- This week: Finish development, test Terraform deployment

## Next Steps
1. ~~Refactorization + config changes~~ — NEGOTIATED OUT ✅
2. S3 metrics logs as TXT — TODO (use existing bucket)
3. Add screenshots to documentation — TODO
4. Test pipeline execution — IN PROGRESS
5. Get valor cliente repo — for downstream understanding

## Outcome
Scope creep partially contained. Main remaining work: S3 TXT logs + screenshots + pipeline testing.

---

## Project Summary (for reference)

### What José Built:
- Migrated 800-line R monolith → Python (10M+ records, 240 features)
- Complete ML pipeline: preprocessing → feature engineering → XGBoost → clustering → reporting
- Deployed on AWS SageMaker Pipelines with MLflow tracking
- Terraform IaC for full AWS infrastructure
- CI/CD via GitHub Actions (Docker build + Terraform deploy)
- 230 tests across unit + integration levels
- Drift detection module (PSI, KS, Chi-squared tests)

### Tech Stack:
- Python, XGBoost, SageMaker Pipelines
- MLflow for experiment tracking
- Terraform for infrastructure
- GitHub Actions for CI/CD
- AWS: S3, ECR, IAM, Transfer Family, Step Functions

### Key Files:
- `src/core/` — ML logic (feature engineering, modeling, clustering, reporting)
- `src/entrypoints/` — Pipeline step executables
- `src/core/drift.py` — Drift detection (~600 lines)
- `deployment/terraform/` — AWS infrastructure (~350 lines)
- `tests/` — 230 tests, ~4,600 lines
