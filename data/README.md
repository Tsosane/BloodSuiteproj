# AI Import Dataset

`ai_blood_demand_import_dataset.csv` is a realistic historical-demand dataset generated for the Blood Suite forecasting pipeline.

What it contains:
- Daily demand records for all 8 blood types
- Date range from `2024-01-01` to `2026-04-21`
- Weekly and monthly seasonality
- Lesotho public-holiday demand effects
- A few anomaly periods such as holiday surges and trauma spikes

How to use it:
1. Sign in as an admin user.
2. Open `/admin/data-import`.
3. Upload `data/ai_blood_demand_import_dataset.csv`.
4. Wait for the import to finish and the forecast retraining to run.

To regenerate the file, run:

```powershell
& 'C:\Users\mmmab\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  'C:\Users\mmmab\OneDrive\Desktop\Blood_suite\Blood_suite\scripts\generate_ai_import_dataset.py'
```
