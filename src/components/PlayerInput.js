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
  const [submittedPlayers, setSubmittedPlayers] = useState([]);
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
  };

  const handleEdit = (id) => {
    setEditId(id);
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setEditValue(entry.input);
    }
  };

  const handleSaveEdit = (id) => {
    const updatedEntries = entries.map(entry =>
      entry.id === id ? { ...entry, input: editValue } : entry
    );
    setEntries(updatedEntries);
    setPlayers(players.map((player, index) => {
      if (index === 0) {
        return { ...player, data: updatedEntries };
      }
      return player;
    }));
    setEditId(null);
    setEditValue("");
  };

  const handleDelete = (id) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    setPlayers(players.map(player => ({
      ...player,
      data: player.data.filter(entry => entry.id !== id),
    })));
  };
  const handleSubmitAndPrint = async (player) => {
    // Check if already submitted
    if (submittedPlayers.includes(player.name)) {
      handlePrint(player);
      return;
    }
    const parsedData = player.data.map(entry => {
      const [number, straight, rumbo] = entry.input.split('=');
      return {
        number,
        straight: parseInt(straight, 10),
        rumbo: rumbo ? parseInt(rumbo, 10) : 0,
      };
    });
    
    const payload = {
      agentId: localStorage.getItem("agentId"),
      name: player.name,
      time: player.time,
      data: parsedData,
    };
    try {
      const response = await fetch('/api/savePlayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        alert('✅ Player data submitted to database!');
        setSubmittedPlayers([...submittedPlayers, player.name]); // mark as submitted
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to submit: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting to database:', error);
      alert('❌ An error occurred while submitting.');
    }
  };
  
  const handlePrint = (player) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Player Data</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: radial-gradient(circle, #111 0%, #000 100%);
              color: #ffd700;
              margin: 0;
              padding: 20px;
            }
            .container {
              background-color: rgba(34, 34, 34, 0.95);
              padding: 30px;
              border-radius: 15px;
              box-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
              max-width: 700px;
              margin: auto;
            }
            h2 {
              color: #ffd700;
              text-align: center;
              font-size: 2.5rem;
              margin-bottom: 10px;
              text-shadow: 0 0 10px red;
            }
            p {
              text-align: center;
              color: #ccc;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #555;
              padding: 12px;
              text-align: center;
            }
            th {
              background: linear-gradient(45deg, #ff0000, #cc0000);
              color: #fff;
              font-size: 1.1rem;
            }
            tr:nth-child(even) {
              background-color: #333;
            }
            tr:nth-child(odd) {
              background-color: #222;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🎰 Player: ${player.name} 🎰</h2>
            <p>🕒 Time: ${player.time}</p>
            <table>
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Input</th>
                </tr>
              </thead>
              <tbody>
                ${player.data
                  .map(
                    (entry) =>
                      `<tr><td>${entry.serial}</td><td>${entry.input}</td></tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  

  const handleAddInputs = () => {
    setInputs([...inputs, ...Array(10).fill("")]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-white p-6 font-mono">
      <div className="max-w-3xl mx-auto bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400 animate-pulse">
          🎰 Player Input 🎰
        </h1>

        <label className="block font-semibold mb-2 text-yellow-300">Player Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full p-3 mb-4 rounded bg-black border-2 border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />

        <label className="block font-semibold mb-2 text-yellow-300">Enter Plays:</label>
        {inputs.map((input, idx) => (
          <input
            key={idx}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            placeholder={`Entry ${idx + 1}`}
            className="w-full p-2 mb-2 rounded bg-black border-2 border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        ))}

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        <div className="flex flex-wrap mt-4 gap-2">
          <button
            onClick={handleSavePlayer}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded shadow"
          >
            🎲 Complete
          </button>
          <button
            onClick={handleAddInputs}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded shadow"
          >
            ➕ Add More
          </button>
        </div>

        {players.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">🎉 Player Summary 🎉</h3>
            {players.map((player, index) => (
              <div key={index} className="mb-6 bg-gray-800 bg-opacity-80 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-xl font-semibold">{player.name}</h4>
                    <p className="text-gray-300">Time: {player.time}</p>
                    <p className="text-gray-300">Total Entries: {player.data.length}</p>
                  </div>
                  <button
  onClick={() => handleSubmitAndPrint(player)}
  className={`mt-4 ${submittedPlayers.includes(player.name) ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-4 rounded shadow`}
>
  {submittedPlayers.includes(player.name) ? '🖨️ Print' : '🚀 Submit to Database'}
</button>


                </div>
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-center bg-yellow-600 text-black">#</th>
                      <th className="border p-2 text-center bg-yellow-600 text-black">Input</th>
                      <th className="border p-2 text-center bg-yellow-600 text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.data.map(entry => (
                      <tr key={entry.id} className="odd:bg-gray-700 even:bg-gray-800">
                        <td className="border p-2 text-center">{entry.serial}</td>
                        <td className="border p-2 text-center">
                          {editId === entry.id ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-full p-1 rounded bg-black border-2 border-yellow-400 text-white"
                            />
                          ) : (
                            entry.input
                          )}
                        </td>
                        <td className="border p-2 text-center space-x-2">
                          {editId === entry.id ? (
                            <button
                              onClick={() => handleSaveEdit(entry.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                            >
                              💾 Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(entry.id)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-2 rounded"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                          >
                            🗑️ Delete
                          </button>
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
    </div>
  );
}
