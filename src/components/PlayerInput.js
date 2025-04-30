// components/PlayerInput.js
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

  // Load data from localStorage if available
  useEffect(() => {
    const storedData = localStorage.getItem("currentPlayerData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setEntries(parsedData.entries);
      setName(parsedData.name);
      setNameLocked(true);
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = () => {
    const currentPlayerData = {
      name,
      entries,
    };
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
      saveToLocalStorage(); // Save data to localStorage after each entry
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
    localStorage.removeItem("currentPlayerData"); // Remove data from localStorage after saving
    saveToDatabase(newPlayer); // Simulate saving to the database
    printPlayerData(newPlayer); // Print the player data
  };

  const saveToDatabase = (player) => {
    // This function simulates saving to the database.
    // You can replace it with an API call to your backend.
    console.log("Saving to database: ", player);
  };

  const printPlayerData = (player) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Player Data</title></head><body>');
    printWindow.document.write('<h2>Player: ' + player.name + '</h2>');
    printWindow.document.write('<p>Time: ' + player.time + '</p>');
    printWindow.document.write('<ul>');
    player.data.forEach(entry => {
      printWindow.document.write('<li>#' + entry.serial + ' → ' + entry.input + '</li>');
    });
    printWindow.document.write('</ul>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const handleDelete = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
    if (updatedEntries.length === 0) {
      setNameLocked(false);
    }
    saveToLocalStorage(); // Save data after deleting an entry
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
          Save This Player
        </button>
      </form>

      {entries.length > 0 && (
        <div style={styles.entriesBox}>
          <h3 style={styles.entriesTitle}>Current Entries</h3>
          <ul style={styles.entryList}>
            {entries.map((entry) => (
              <li key={entry.id} style={styles.entryItem}>
                <strong>#{entry.serial}</strong> → {entry.input}
                <br />
                <button onClick={() => handleEdit(entry.id)} style={styles.editButton}>
                  Edit
                </button>{" "}
                <button onClick={() => handleDelete(entry.id)} style={styles.deleteButton}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {players.length > 0 && (
        <div style={styles.entriesBox}>
          <h3 style={styles.entriesTitle}>All Players</h3>
          <ul style={styles.entryList}>
            {players.map((player, index) => (
              <li key={index} style={{ ...styles.entryItem, backgroundColor: "#e3f7ff" }}>
                <strong>{player.name}</strong> ({player.time})
                <ul>
                  {player.data.map((p) => (
                    <li key={p.id}>
                      #{p.serial} → {p.input}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: "1rem",
    maxWidth: "400px",
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
    fontSize: "0.8rem",
    marginBottom: "0.5rem",
  },
  button: {
    width: "100%",
    padding: "0.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  entriesBox: {
    marginTop: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  entriesTitle: {
    marginBottom: "0.5rem",
    fontWeight: "bold",
    fontSize: "1.2rem",
    color: "#333",
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
  deleteButton: {
    marginTop: "0.5rem",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    cursor: "pointer",
    marginLeft: "0.5rem",
  },
  editButton: {
    marginTop: "0.5rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
};
