"""
data_loader.py
Loads, cleans, and validates the Brent crude oil price dataset.
"""
import os
import logging
import pandas as pd
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "BrentOilPrices.csv")
ANALYSIS_END_DATE = "2022-09-30"


def load_brent_prices(path: str = RAW_PATH, end_date: str = ANALYSIS_END_DATE) -> pd.DataFrame:
    """
    Loads the raw Brent oil price CSV, parses dates (handling mixed formats),
    sorts chronologically, trims to the specified analysis window, and computes
    log price / log return columns.

    Raises FileNotFoundError with a clear message if the source file is missing.
    """
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Brent price data not found at {path}. "
            f"Download BrentOilPrices.csv and place it in data/raw/."
        )

    try:
        df = pd.read_csv(path)
    except pd.errors.EmptyDataError:
        raise ValueError(f"{path} exists but is empty or corrupted.")

    if "Date" not in df.columns or "Price" not in df.columns:
        raise ValueError(f"Expected columns 'Date' and 'Price', found: {list(df.columns)}")

    # Source file mixes two date formats (e.g. '20-May-87' and 'Apr 22, 2020')
    df["Date"] = pd.to_datetime(df["Date"], format="mixed")
    df = df.sort_values("Date").reset_index(drop=True)
    df = df.set_index("Date")

    n_before = len(df)
    df = df[df.index <= end_date]
    n_after = len(df)
    if n_before != n_after:
        logger.info(f"Trimmed {n_before - n_after} rows beyond analysis end date {end_date}")

    if df["Price"].isnull().any():
        n_missing = df["Price"].isnull().sum()
        logger.warning(f"{n_missing} missing price values found — forward-filling")
        df["Price"] = df["Price"].ffill()

    df["Log_Price"] = np.log(df["Price"])
    df["Log_Return"] = df["Log_Price"].diff()

    logger.info(f"Loaded {len(df)} rows, {df.index.min().date()} to {df.index.max().date()}")
    return df


def load_key_events(path: str = None) -> pd.DataFrame:
    """Loads the researched key events CSV."""
    if path is None:
        path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "key_events.csv")

    if not os.path.exists(path):
        raise FileNotFoundError(f"Key events file not found at {path}.")

    events = pd.read_csv(path, parse_dates=["date"])
    logger.info(f"Loaded {len(events)} key events")
    return events


if __name__ == "__main__":
    prices = load_brent_prices()
    events = load_key_events()
    print(prices.head())
    print(events.head())