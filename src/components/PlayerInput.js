"use client";

import { useState, useEffect } from "react";

export default function PlayerInput() {
  const [name, setName] = useState("");
  const [inputs, setInputs] = useState(Array(10).fill(""));
  const [entries, setEntries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("currentPlayerData");
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setName(parsed.name);
      const filledInputs = parsed.entries.map(e => e.input);
      setInputs([...filledInputs, ...Array(10 - filledInputs.length).fill("")]);
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (!/^[\d=]*$/.test(value)) return;
    const parts = value.split("=");
    const first = parts[0];
    const equalsCount = (value.match(/=/g) || []).length;

    if (!/^\d*$/.test(first)) return;
    if (first.length > 3) return;
    if ((first.length === 1 && equalsCount > 1) || (first.length >= 2 && equalsCount > 2)) return;
    if (parts.slice(1).some(p => p && !/^\d*$/.test(p))) return;

    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);
  };

  const handleSavePlayer = async () => {
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    const validInputs = inputs.filter(input => input.trim() !== "");
    if (validInputs.length === 0) {
      setError("Please fill at least one entry");
      return;
    }

    const newEntries = validInputs.map((input, idx) => ({
      id: Date.now() + idx,
      serial: idx + 1,
      input,
    }));

    setEntries(newEntries);
    setPlayers([{ name, time: new Date().toLocaleString(), data: newEntries }, ...players]);
    setName("");
    setInputs(Array(10).fill(""));
    localStorage.removeItem("currentPlayerData");

    try {
      const res = await fetch("/api/playerInput", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, time: new Date().toLocaleString(), data: newEntries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      console.log("Saved to MongoDB:", data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleEdit = (id) => {
    setEditId(id);
    const entry = entries.find(e => e.id === id);  // Find entry based on the correct id
    if (entry) {
      setEditValue(entry.input);  // Only set value if entry is found
    }
  };

  const handleSaveEdit = (id) => {
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, input: editValue } : entry
    );
    setEntries(updatedEntries);  // Save the updated entry to the state
    setEditId(null);  // Exit edit mode
    setEditValue("");  // Reset the edit value
  };

  const handleDelete = (id) => {
    console.log("Deleting entry with ID:", id); // Log the ID of the entry being deleted
    const updatedEntries = entries.filter(entry => entry.id !== id); // Only remove the targeted entry
    console.log("Updated entries after delete:", updatedEntries); // Log the updated list of entries
    setEntries(updatedEntries); // Update the state to remove the entry
};

  const handlePrint = (player) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Player Data</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background-color: #f9f9f9; }
            .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 800px; margin: auto; }
            h2 { text-align: center; color: #333; }
            p { text-align: center; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
            th { background-color: #007bff; color: #fff; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Player: ${player.name}</h2>
            <p>Time: ${player.time}</p>
            <table>
              <thead>
                <tr><th>Serial</th><th>Input</th></tr>
              </thead>
              <tbody>
                ${player.data.map(entry => `
                  <tr><td>${entry.serial}</td><td>${entry.input}</td></tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.form}>
        <label style={styles.label}>Player Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={styles.input}
        />

        <label style={styles.label}>Enter Plays (10 rows):</label>
        {inputs.map((input, idx) => (
          <div key={idx} style={styles.inputRow}>
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              placeholder={`Entry ${idx + 1}`}
              style={styles.input}
            />
          </div>
        ))}

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="button"
          onClick={handleSavePlayer}
          style={{ ...styles.button, backgroundColor: "#28a745" }}
        >
          Complete
        </button>
      </div>

      {players.length > 0 && (
        <div style={styles.entriesBox}>
          <h3 style={styles.entriesTitle}>Player Summary</h3>
          {players.map((player, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0" }}>Player Name: {player.name}</h4>
                  <p style={{ margin: "0" }}>Time: {player.time}</p>
                  <p style={{ margin: "0" }}>Total Entries: {player.data.length}</p>
                </div>
                <button onClick={() => handlePrint(player)} style={styles.printButton}>Print</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Serial</th>
                    <th style={styles.tableHeader}>Input</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {player.data.map(entry => (
                    <tr key={entry.id}>
                      <td style={styles.tableCell}>{entry.serial}</td>
                      <td style={styles.tableCell}>
                        {editId === entry.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={styles.input}
                          />
                        ) : (
                          entry.input
                        )}
                      </td>
                      <td style={styles.tableCell}>
                        {editId === entry.id ? (
                          <button onClick={() => handleSaveEdit(entry.id)} style={styles.saveButton}>Save</button>
                        ) : (
                          <button onClick={() => handleEdit(entry.id)} style={styles.editButton}>Edit</button>
                        )}
                        <button onClick={() => handleDelete(entry.id)} style={styles.deleteButton}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { padding: "20px", fontFamily: "sans-serif" },
  form: { maxWidth: "400px", margin: "0 auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" },
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: { width: "calc(100% - 80px)", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" },
  inputRow: { display: "flex", marginBottom: "10px", alignItems: "center" },
  button: { width: "100%", padding: "10px", border: "none", borderRadius: "4px", color: "#fff", fontWeight: "bold", cursor: "pointer" },
  error: { color: "red", marginBottom: "10px" },
  entriesBox: { marginTop: "30px" },
  entriesTitle: { fontSize: "1.2rem", fontWeight: "bold" },
  tableHeader: { textAlign: "left", padding: "8px", backgroundColor: "#007bff", color: "#fff" },
  tableCell: { padding: "8px", borderBottom: "1px solid #ddd" },
  editButton: { backgroundColor: "#ff9e00", color: "#fff", padding: "5px", border: "none", cursor: "pointer" },
  saveButton: { backgroundColor: "#28a745", color: "#fff", padding: "5px", border: "none", cursor: "pointer" },
  deleteButton: { backgroundColor: "#e74c3c", color: "#fff", padding: "5px", border: "none", cursor: "pointer" },
  printButton: { backgroundColor: "#3498db", color: "#fff", padding: "5px", border: "none", cursor: "pointer" },
};
