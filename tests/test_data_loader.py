
import os
import sys
import pandas as pd
import pytest

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from src.data_loader import load_brent_prices, load_key_events


def test_load_brent_prices_returns_dataframe():
    df = load_brent_prices()
    assert isinstance(df, pd.DataFrame)
    assert "Log_Return" in df.columns
    assert df.index.max() <= pd.Timestamp("2022-09-30")


def test_load_brent_prices_missing_file_raises():
    with pytest.raises(FileNotFoundError):
        load_brent_prices(path="nonexistent_file.csv")


def test_load_key_events_returns_dataframe():
    events = load_key_events()
    assert isinstance(events, pd.DataFrame)
    assert len(events) >= 10
    assert "date" in events.columns
