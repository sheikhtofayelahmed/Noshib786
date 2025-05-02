"use client";

import { useState, useEffect } from "react";

export default function PlayerInput() {
  const [name, setName] = useState("");
  const [nameLocked, setNameLocked] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [entries, setEntries] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("currentPlayerData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setEntries(parsedData.entries);
      setName(parsedData.name);
      setNameLocked(true);
    }
  }, []);

  const saveToLocalStorage = () => {
    const currentPlayerData = { name, entries };
    localStorage.setItem("currentPlayerData", JSON.stringify(currentPlayerData));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const validPattern = /^\d{0,3}(=\d{0,2}){0,2}$/;
    if (value === "" || validPattern.test(value)) {
      setCurrentInput(value);
      setError("");
    } else {
      setError("Format: 123=10=20 only. Max 3 digits before =");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{1,3}=\d{1,2}=\d{1,2}$/.test(currentInput)) {
      setError("Please enter in correct format: 123=10=10");
    } else {
      if (editId !== null) {
        setEntries(entries.map(entry => entry.id === editId ? { ...entry, input: currentInput } : entry));
        setEditId(null);
      } else {
        const newEntry = {
          id: Date.now(),
          serial: entries.length + 1,
          input: currentInput,
        };
        setEntries([newEntry, ...entries]);
        if (!nameLocked) setNameLocked(true);
      }
      setCurrentInput("");
      setError("");
      saveToLocalStorage();
    }
  };

  const handleSavePlayer = () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (entries.length === 0) {
      setError("No inputs to save");
      return;
    }
    const newPlayer = {
      name,
      time: new Date().toLocaleString(),
      data: entries,
    };
    setPlayers([...players, newPlayer]);
    setName("");
    setEntries([]);
    setCurrentInput("");
    setError("");
    setEditId(null);
    setNameLocked(false);
    localStorage.removeItem("currentPlayerData");
    saveToDatabase(newPlayer);
  };

  const saveToDatabase = async (player) => {
    try {
      const response = await fetch('/api/playerInput', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Saved to MongoDB:', data);
      } else {
        console.error('Failed to save:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const printPlayerData = (player) => {
    const printWindow = window.open('', '_blank');
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
                <tr><th>Serial</th><th>Part 1</th><th>Part 2</th><th>Part 3</th></tr>
              </thead>
              <tbody>
                ${player.data.map(entry => {
                  const [part1, part2, part3] = entry.input.split('=');
                  return `<tr><td>${entry.serial}</td><td>${part1}</td><td>${part2}</td><td>${part3}</td></tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDelete = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    if (updatedEntries.length === 0) setNameLocked(false);
    saveToLocalStorage();
  };

  const handleEdit = (id) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setCurrentInput(entry.input);
      setEditId(id);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Your Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={styles.input}
          disabled={nameLocked}
        />
        <label style={styles.label}>Enter Play:</label>
        <input
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          placeholder="123=10=10"
          style={styles.input}
          inputMode="numeric"
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>
          {editId !== null ? "Update Entry" : "Add Entry"}
        </button>
        <button
          type="button"
          onClick={handleSavePlayer}
          style={{ ...styles.button, backgroundColor: "#007bff", marginTop: "0.5rem" }}
        >
          Complete
        </button>
      </form>

      {entries.length > 0 && (
        <div style={styles.entriesBox}>
          <h3 style={styles.entriesTitle}>Current Entries</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Part 1</th>
                <th style={styles.tableHeader}>Part 2</th>
                <th style={styles.tableHeader}>Part 3</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice().sort((a, b) => a.serial - b.serial).map((entry) => {
                const [part1, part2, part3] = entry.input.split('=');
                return (
                  <tr key={entry.id}>
                    <td style={styles.tableCell}>{part1}</td>
                    <td style={styles.tableCell}>{part2}</td>
                    <td style={styles.tableCell}>{part3}</td>
                    <td style={styles.tableCell}>
                      <button onClick={() => handleEdit(entry.id)} style={styles.editButton}>Edit</button>
                      <button onClick={() => handleDelete(entry.id)} style={styles.deleteButton}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {players.length > 0 && (
        <div style={styles.entriesBox}>
          <h3 style={styles.entriesTitle}>Agent Summary</h3>
          {players.map((player, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
  <div>
    <h4 style={{ margin: "0" }}>Player Name: {player.name}</h4>
    <p style={{ margin: "0" }}>Time: {player.time}</p>
    <p style={{ margin: "0" }}>Total Entries: {player.data.length}</p>
  </div>
  <button
    onClick={() => printPlayerData(player)}
    style={styles.printButton}
  >
    Print
  </button>
</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Part 1</th>
                    <th style={styles.tableHeader}>Part 2</th>
                    <th style={styles.tableHeader}>Part 3</th>
                  </tr>
                </thead>
                <tbody>
                  {player.data.map((entry) => {
                    const [part1, part2, part3] = entry.input.split('=');
                    return (
                      <tr key={entry.id}>
                        <td style={styles.tableCell}>{part1}</td>
                        <td style={styles.tableCell}>{part2}</td>
                        <td style={styles.tableCell}>{part3}</td>
                      </tr>
                    );
                  })}
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
  wrapper: {
    padding: "1rem",
    maxWidth: "600px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  label: {
    display: "block",
    marginBottom: "0.4rem",
    fontWeight: "bold",
    textAlign: "left",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "0.7rem",
  },
  error: {
    color: "red",
    fontSize: "0.85rem",
    marginBottom: "0.5rem",
  },
  button: {
    width: "33%",
    padding: "0.5rem",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    marginBottom: "0.5rem",
    
  },
  printButton: {
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  
  
  editButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
    marginRight: "0.3rem",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  entriesBox: {
    marginTop: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 0 8px rgba(0,0,0,0.05)",
  },
  entriesTitle: {
    marginBottom: "0.8rem",
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "#333",
    textAlign: "center",
  },
  entryList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  entryItem: {
    backgroundColor: "#fff",
    padding: "0.6rem",
    marginBottom: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "0.95rem",
  },
  tableHeader: {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  },
};
