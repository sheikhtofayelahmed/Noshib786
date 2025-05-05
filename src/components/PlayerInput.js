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
    const stored = localStorage.getItem("currentPlayerData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setName(parsed.name);
      const filled = parsed.entries.map(e => e.input);
      setInputs([...filled, ...Array(10 - filled.length).fill("")]);
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (!/^[\d=]*$/.test(value)) return;
    const updated = [...inputs];
    updated[index] = value;
    setInputs(updated);
  };

  const handleSavePlayer = () => {
    setError("");
    if (!name.trim()) return setError("Please enter your name");

    const valid = inputs.filter(i => i.trim() !== "");
    if (valid.length === 0) return setError("Please fill at least one entry");

    const newEntries = valid.map((input, i) => ({
      id: Date.now() + i,
      serial: i + 1,
      input,
    }));

    const newPlayer = {
      name,
      time: new Date().toLocaleString(),
      data: newEntries,
    };

    setEntries(newEntries);
    setPlayers([newPlayer, ...players]);
    setName("");
    setInputs(Array(10).fill(""));
    localStorage.removeItem("currentPlayerData");
  };

  const handleEdit = (id) => {
    setEditId(id);
    const entry = entries.find(e => e.id === id);
    if (entry) setEditValue(entry.input);
  };

  const handleSaveEdit = (id) => {
    const updated = entries.map(e => (e.id === id ? { ...e, input: editValue } : e));
    setEntries(updated);
    setPlayers(players.map((p, idx) => idx === 0 ? { ...p, data: updated } : p));
    setEditId(null);
    setEditValue("");
  };

  const handleDelete = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    setPlayers(players.map(p => ({
      ...p,
      data: p.data.filter(e => e.id !== id),
    })));
  };

  const handleSubmitAndPrint = async (player) => {
    if (submittedPlayers.includes(player.name)) {
      handlePrint(player);
      return;
    }

    const parsedData = player.data.map(entry => ({
      input: entry.input,
    }));

    const payload = {
      agentId: localStorage.getItem("agentId") || "testAgent",
      name: player.name,
      time: player.time,
      data: parsedData,
    };

    try {
      const res = await fetch('/api/savePlayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('✅ Player data submitted to database!');
        setSubmittedPlayers([...submittedPlayers, player.name]);
      } else {
        const err = await res.json();
        alert(`❌ Failed to submit: ${err.message}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('❌ An error occurred while submitting.');
    }
  };

  const handlePrint = (player) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Player Data</title>
          <style>
            body { font-family: Arial; background: #000; color: #ffd700; padding: 20px; }
            .container { background: #222; padding: 20px; border-radius: 10px; }
            h2 { text-align: center; }
            table { width: 100%; margin-top: 20px; border-collapse: collapse; }
            th, td { border: 1px solid #555; padding: 10px; text-align: center; }
            th { background: #cc0000; color: #fff; }
            tr:nth-child(even) { background: #333; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🎰 ${player.name}</h2>
            <p>🕒 ${player.time}</p>
            <table>
              <thead>
                <tr><th>#</th><th>Input</th></tr>
              </thead>
              <tbody>
                ${player.data.map(e => `<tr><td>${e.serial}</td><td>${e.input}</td></tr>`).join("")}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleAddInputs = () => {
    setInputs([...inputs, ...Array(10).fill("")]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">🎰 Player Input 🎰</h1>

        <label className="block mb-2 text-yellow-300">Player Name:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full p-3 mb-4 rounded bg-black border-2 border-yellow-400 text-white"
        />

        <label className="block mb-2 text-yellow-300">Enter Plays:</label>
        {inputs.map((input, i) => (
          <input
            key={i}
            type="text"
            value={input}
            onChange={e => handleInputChange(i, e.target.value)}
            placeholder={`Entry ${i + 1}`}
            className="w-full p-2 mb-2 rounded bg-black border-2 border-yellow-400 text-white"
          />
        ))}

        {error && <p className="text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleSavePlayer}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
          >
            🎲 Complete
          </button>
          <button
            onClick={handleAddInputs}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
          >
            ➕ Add More
          </button>
        </div>

        {players.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl text-yellow-400 mb-4">🎉 Player Summary 🎉</h3>
            {players.map((player, idx) => (
              <div key={idx} className="mb-6 bg-gray-800 p-4 rounded">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-xl">{player.name}</h4>
                    <p>Time: {player.time}</p>
                    <p>Entries: {player.data.length}</p>
                  </div>
                  <button
                    onClick={() => handleSubmitAndPrint(player)}
                    className={`py-2 px-4 rounded ${
                      submittedPlayers.includes(player.name)
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {submittedPlayers.includes(player.name) ? '🖨️ Print' : '🚀 Submit'}
                  </button>
                </div>
                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr>
                      <th className="border bg-yellow-600 text-black">#</th>
                      <th className="border bg-yellow-600 text-black">Input</th>
                      <th className="border bg-yellow-600 text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.data.map(entry => (
                      <tr key={entry.id} className="odd:bg-gray-700 even:bg-gray-800">
                        <td className="border p-2">{entry.serial}</td>
                        <td className="border p-2">
                          {editId === entry.id ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-full p-1 bg-black border-2 border-yellow-400 text-white"
                            />
                          ) : (
                            entry.input
                          )}
                        </td>
                        <td className="border p-2 space-x-2">
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
