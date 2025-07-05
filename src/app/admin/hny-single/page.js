import React, { useEffect, useState } from "react";

export default function NumberPayoutTable() {
  const [data, setData] = useState({ threeD: [], twoD: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPayouts() {
      try {
        const res = await fetch("/api/profitLose", { method: "POST" }); // change URL to your API route
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPayouts();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderTable = (title, numbers) => (
    <div style={{ marginBottom: "2rem" }}>
      <h2>{title}</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Number</th>
            <th>Str Amount</th>
            <th>Rumble Amount</th>
            <th>Payout</th>
            <th>Profit / Loss</th>
          </tr>
        </thead>
        <tbody>
          {numbers.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No data available
              </td>
            </tr>
          ) : (
            numbers.map(({ number, str, rumble, payout, profitLoss }) => (
              <tr key={number}>
                <td>{number}</td>
                <td>{str}</td>
                <td>{rumble}</td>
                <td>{payout}</td>
                <td>{profitLoss}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Lottery Numbers and Payouts</h1>
      {renderTable("3-Digit Numbers", data.threeD)}
      {renderTable("2-Digit Numbers", data.twoD)}
    </div>
  );
}
