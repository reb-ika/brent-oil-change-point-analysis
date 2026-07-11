# Change Point Analysis of Brent Crude Oil Prices

**Client:** Birhan Energies (energy market consultancy) &nbsp;|&nbsp; **Program:** 10 Academy Kifiya AI Mastery Program — Week 10

## Business Context

Birhan Energies provides data-driven insights to investors, policymakers, and energy companies navigating oil market volatility. This project applies Bayesian change point detection to identify structural breaks in Brent crude oil prices and associate them with major geopolitical and economic events, translating statistical findings into actionable intelligence.

## Data

Daily Brent crude oil prices (USD/barrel), May 20, 1987 – September 30, 2022 (8,980 trading days).

## Project Structure
brent-oil-change-point-analysis/
├── .github/workflows/       # CI
├── data/
│   ├── raw/                  # Original BrentOilPrices.csv
│   └── processed/            # key_events.csv, cleaned data
├── notebooks/
│   └── 1.0-eda.ipynb          # Task 1: EDA, stationarity, volatility
├── src/
├── tests/
├── scripts/
├── docs/
│   └── Task1_Analysis_Workflow.docx
└── requirements.txt
## Setup

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m ipykernel install --user --name=brent-venv --display-name "Python (brent-oil-analysis)"
```

## Methodology

### Task 1 — Foundation
- Compiled 15 major geopolitical/OPEC/economic events (1987–2022) with dates and descriptions (`data/processed/key_events.csv`)
- EDA: raw price trend, log returns, 30-day rolling volatility
- ADF stationarity tests: raw price non-stationary (p≈0.29), log returns stationary (p<0.0001) — motivates modeling log returns rather than raw price levels
- Documented assumptions, limitations, and the correlation-vs-causation distinction (`docs/Task1_Analysis_Workflow.docx`)

### Task 2 — Bayesian Change Point Modeling *(in progress)*
PyMC model with discrete uniform prior on switch point (tau), distinct before/after parameters, Normal likelihood via `pm.math.switch`, MCMC sampling and convergence diagnostics.

### Task 3 — Interactive Dashboard *(planned)*
Flask backend + React frontend for stakeholder exploration of price history, change points, and event correlations.

## Key Technical Notes
- Raw CSV contained two inconsistent date formats, resolved via `pd.to_datetime(..., format="mixed")`
- Data trimmed to the brief's specified end date (source file extended ~6 weeks further)
- Low-RAM environment: chunked/incremental processing where relevant

## Author
Rebika Woldeyesus — 10 Academy Kifiya AI Mastery Program, Week 10