'use client'
import { useEffect, useState } from "react";

export default function NumbersPage() {
  const [data, setData] = useState({ threeD: [], twoD: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/profitLoss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderTable = (title, numbers) => (
    <section style={{ marginBottom: 40 }}>
      <h2>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={th}>Number</th>
            <th style={th}>Str</th>
            <th style={th}>Rumble</th>
            <th style={th}>Payout</th>
            <th style={th}>Profit/Loss</th>
          </tr>
        </thead>
        <tbody>
          {numbers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: 12, textAlign: "center" }}>
                No data
              </td>
            </tr>
          ) : (
            numbers.map(({ number, str, rumble, payout, profitLoss }) => (
              <tr key={number}>
                <td style={td}>{number}</td>
                <td style={td}>{str}</td>
                <td style={td}>{rumble}</td>
                <td style={td}>{payout}</td>
                <td style={td}>{profitLoss}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );

  const th = {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    textAlign: "left",
  };

  const td = {
    border: "1px solid #ddd",
    padding: "8px",
  };

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Lottery Number Payouts</h1>
      {renderTable("3-Digit Numbers", data.threeD)}
      {renderTable("2-Digit Numbers", data.twoD)}
    </main>
  );
}
