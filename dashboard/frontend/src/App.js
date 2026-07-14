import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ReferenceLine, ResponsiveContainer, Brush
} from "recharts";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [prices, setPrices] = useState([]);
  const [events, setEvents] = useState([]);
  const [changepoints, setChangepoints] = useState(null);
  const [startDate, setStartDate] = useState("1987-05-20");
  const [endDate, setEndDate] = useState("2022-09-30");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricesRes, eventsRes, cpRes] = await Promise.all([
        axios.get(`${API_BASE}/prices`),
        axios.get(`${API_BASE}/events`),
        axios.get(`${API_BASE}/changepoints`),
      ]);
      setPrices(pricesRes.data);
      setEvents(eventsRes.data);
      setChangepoints(cpRes.data);
    } catch (err) {
      setError("Could not connect to the backend API. Make sure the Flask server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/prices`, {
        params: { start_date: startDate, end_date: endDate },
      });
      setPrices(res.data);
    } catch (err) {
      setError("Failed to filter data.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(
    (e) => e.date >= startDate && e.date <= endDate
  );

  if (loading) return <div className="container"><p>Loading dashboard data...</p></div>;
  if (error) return <div className="container"><p className="error">{error}</p></div>;

  return (
    <div className="container">
      <header>
        <h1>Brent Crude Oil: Change Point Analysis Dashboard</h1>
        <p className="subtitle">Birhan Energies &mdash; Statistical Analysis of Price Regime Shifts, 1987&ndash;2022</p>
      </header>

      <section className="filters">
        <label>
          Start Date:
          <input type="date" value={startDate} min="1987-05-20" max="2022-09-30"
                 onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} min="1987-05-20" max="2022-09-30"
                 onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={applyDateFilter}>Apply Filter</button>
      </section>

      {changepoints && (
        <section className="summary-cards">
          <div className="card">
            <h3>Dominant Change Point</h3>
            <p className="big">{changepoints.dominant_tau_date}</p>
            <p className="small">{(changepoints.dominant_tau_probability * 100)?.toFixed(1)}% of posterior samples</p>
          </div>
          <div className="card">
            <h3>Mean Return Before</h3>
            <p className="big">{changepoints.mu_1_annualized_pct?.toFixed(2)}%</p>
            <p className="small">annualized</p>
          </div>
          <div className="card">
            <h3>Mean Return After</h3>
            <p className="big">{changepoints.mu_2_annualized_pct?.toFixed(2)}%</p>
            <p className="small">annualized</p>
          </div>
          <div className="card">
            <h3>P(shift is real)</h3>
            <p className="big">{(changepoints.prob_mu2_greater_mu1 * 100)?.toFixed(1)}%</p>
            <p className="small">P(mu&#8322; &gt; mu&#8321;)</p>
          </div>
        </section>
      )}

      <section className="chart-section">
        <h2>Price History with Event Overlay</h2>
        <p className="hint">Click an event below to highlight it on the chart. Drag the brush at the bottom to zoom into a date range.</p>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={prices} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Date" tick={{ fontSize: 11 }} minTickGap={60} />
            <YAxis label={{ value: "USD/barrel", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Price" stroke="#1a1a2e" dot={false} strokeWidth={1.2} name="Brent Price" />
            {changepoints && (
              <ReferenceLine
                x={changepoints.dominant_tau_date}
                stroke="red"
                strokeWidth={2}
                label={{ value: "Detected Change Point", position: "top", fill: "red", fontSize: 11 }}
              />
            )}
            {selectedEvent && (
              <ReferenceLine
                x={selectedEvent.date}
                stroke="orange"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ value: selectedEvent.event_name, position: "insideTop", fill: "orange", fontSize: 10 }}
              />
            )}
            <Brush dataKey="Date" height={25} stroke="#1a1a2e" />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="events-section">
        <h2>Key Events ({filteredEvents.length} in selected range)</h2>
        <div className="events-list">
          {filteredEvents.map((event) => (
            <div
              key={event.event_id}
              className={`event-card ${selectedEvent?.event_id === event.event_id ? "selected" : ""}`}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="event-header">
                <span className="event-date">{event.date}</span>
                <span className={`event-category cat-${event.category?.replace(/[^a-zA-Z]/g, "")}`}>
                  {event.category}
                </span>
              </div>
              <h4>{event.event_name}</h4>
              {selectedEvent?.event_id === event.event_id && (
                <p className="event-description">{event.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;