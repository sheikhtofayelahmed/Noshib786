"use client";

import { useState } from "react";

export default function PlayerInput() {
  const [name, setName] = useState("");
  const [inputs, setInputs] = useState(Array(20).fill(""));
  const [errors, setErrors] = useState(Array(20).fill(false));
  const [players, setPlayers] = useState([]);

  const handleInputChange = (index, value) => {
    setInputs(inputs.map((inp, i) => (i === index ? value : inp)));
    setErrors(errors.map((err, i) => (i === index ? false : err)));
  };

  const validateEntry = (input) => {
    if (!input) return true;
    if (!/^[\d=]+$/.test(input)) return false;
    if (input.startsWith("=")) return false;

    const parts = input.split("=");
    const first = parts[0];

    if (/^\d$/.test(first)) {
      return parts.length === 2 && parts[1].length > 0;
    } else if (/^\d{2,3}$/.test(first)) {
      return (
        parts.length >= 2 &&
        parts.length <= 3 &&
        parts.slice(1).every((p) => p.length > 0)
      );
    }

    return false;
  };

  const handleSavePlayer = () => {
    const newErrors = inputs.map((input) => !validateEntry(input));

    if (newErrors.includes(true)) {
      setErrors(newErrors);
      return;
    }

    const validEntries = inputs.filter((i) => i.trim() !== "");

    const newEntries = validEntries.map((input, i) => ({
      id: Date.now() + i,
      serial: i + 1,
      input,
      isEditing: false,
      editValue: input,
      editError: false,
    }));

    const voucherNumber = `VOUCHER-${Date.now()}`;

    const newPlayer = {
      name,
      time: new Date().toLocaleString(),
      voucher: voucherNumber,
      data: newEntries,
    };

    setPlayers([newPlayer, ...players]);
    setName("");
    setInputs(Array(20).fill(""));
    setErrors(Array(20).fill(false));
  };

  const handleAddInputs = () => {
    setInputs([...inputs, ...Array(20).fill("")]);
    setErrors([...errors, ...Array(20).fill(false)]);
  };

  const handleEdit = (playerIdx, entryIdx) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((entry, j) =>
                j === entryIdx ? { ...entry, isEditing: true } : entry
              ),
            }
          : player
      )
    );
  };

  const handleEditChange = (playerIdx, entryIdx, value) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((entry, j) =>
                j === entryIdx
                  ? { ...entry, editValue: value, editError: false }
                  : entry
              ),
            }
          : player
      )
    );
  };

  const handleSaveEdit = (playerIdx, entryIdx) => {
    const entry = players[playerIdx].data[entryIdx];
    const isValid = validateEntry(entry.editValue);

    if (!isValid) {
      setPlayers(
        players.map((player, i) =>
          i === playerIdx
            ? {
                ...player,
                data: player.data.map((e, j) =>
                  j === entryIdx ? { ...e, editError: true } : e
                ),
              }
            : player
        )
      );
      return;
    }

    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((e, j) =>
                j === entryIdx
                  ? {
                      ...e,
                      input: e.editValue,
                      isEditing: false,
                      editError: false,
                    }
                  : e
              ),
            }
          : player
      )
    );
  };

  const handleDelete = (playerIdx, entryIdx) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.filter((_, j) => j !== entryIdx),
            }
          : player
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl p-6">
        <h1 className="text-4xl font-bold text-center mb-6 text-yellow-400">🎰 Player Input 🎰</h1>

        <label className="block mb-2 text-yellow-300">Player Name (optional):</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full p-3 mb-4 rounded bg-black border-2 border-yellow-400 text-white"
        />

        <label className="block mb-2 text-yellow-300">Enter Plays:</label>
        {inputs.map((input, i) => (
          <input
            key={i}
            type="text"
            value={input}
            onChange={(e) => handleInputChange(i, e.target.value)}
            placeholder={`Entry ${i + 1}`}
            className={`w-full p-2 mb-2 rounded bg-black border-2 text-white ${
              errors[i] ? "border-red-500 bg-red-900" : "border-yellow-400"
            }`}
          />
        ))}

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
            ➕ Add More (20)
          </button>
        </div>

        {players.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl text-yellow-400 mb-4">🎉 Player Summary 🎉</h3>
            {players.map((player, idx) => (
              <div key={idx} className="mb-6 bg-gray-800 p-4 rounded">
                <h4 className="text-xl">{player.name || "Unnamed Player"}</h4>
                <p>🕒 {player.time}</p>
                <p>🎟️ Voucher: {player.voucher}</p>
                <p>Entries: {player.data.length}</p>
                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr>
                      <th className="border bg-yellow-600 text-black">#</th>
                      <th className="border bg-yellow-600 text-black">Input</th>
                      <th className="border bg-yellow-600 text-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.data.map((entry, entryIdx) => (
                      <tr key={entry.id} className="odd:bg-gray-700 even:bg-gray-800">
                        <td className="border p-2">{entry.serial}</td>
                        <td className="border p-2">
                          {entry.isEditing ? (
                            <input
                              type="text"
                              value={entry.editValue}
                              onChange={(e) =>
                                handleEditChange(idx, entryIdx, e.target.value)
                              }
                              className={`w-full p-1 rounded bg-black border-2 text-white ${
                                entry.editError ? "border-red-500 bg-red-900" : "border-yellow-400"
                              }`}
                            />
                          ) : (
                            entry.input
                          )}
                        </td>
                        <td className="border p-2 space-x-2">
                          {entry.isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(idx, entryIdx)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(idx, entryIdx)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(idx, entryIdx)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                          >
                            Delete
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
