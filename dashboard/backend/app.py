"""
Flask API serving Brent oil price data, change point results, and event correlations
for the React dashboard.
"""
import os
import json
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")


def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"{filename} not found in {DATA_DIR}. Run the analysis notebook first.")
    with open(path, "r") as f:
        return json.load(f)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/prices", methods=["GET"])
def get_prices():
    """
    Historical price data, with optional date range filtering.
    Query params: start_date, end_date (YYYY-MM-DD)
    """
    try:
        prices = load_json("price_history.json")
    except FileNotFoundError as e:
        logger.error(str(e))
        return jsonify({"error": str(e)}), 404

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    if start_date:
        prices = [p for p in prices if p["Date"] >= start_date]
    if end_date:
        prices = [p for p in prices if p["Date"] <= end_date]

    return jsonify(prices)


@app.route("/api/changepoints", methods=["GET"])
def get_changepoints():
    """Bayesian change point model results: dominant tau, quantified impact, top candidates."""
    try:
        results = load_json("change_point_results.json")
    except FileNotFoundError as e:
        logger.error(str(e))
        return jsonify({"error": str(e)}), 404

    return jsonify(results)


@app.route("/api/events", methods=["GET"])
def get_events():
    """Compiled key events dataset."""
    path = os.path.join(DATA_DIR, "key_events.csv")
    if not os.path.exists(path):
        return jsonify({"error": "key_events.csv not found"}), 404

    events = pd.read_csv(path)
    return jsonify(events.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)