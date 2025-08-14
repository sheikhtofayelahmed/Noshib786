"use client";
import React, { useRef } from "react";

import { useState, useEffect } from "react";
import { useAgent } from "src/context/AgentContext";

import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";
import QRCode from "qrcode";
import { useGamer } from "@/context/GamerContext";
export default function GamerInput({}) {
  const [name, setName] = useState("");
  const [inputs, setInputs] = useState(
    Array(20).fill({ num: "", str: "", rumble: "" })
  );
  const [errors, setErrors] = useState(Array(20).fill(false));
  const [players, setPlayers] = useState([]);
  const [amountPlayed, setAmountPlayed] = useState({});
  const { gamerId, agent, fetchEntryCount } = useGamer();
  const playerRefs = useRef({});
  const [submittingVoucher, setSubmittingVoucher] = useState(null);
  const [showInput, setShowInput] = useState(true);
  const [targetTime, setTargetTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ text: "", isWarning: false });
  const [error, setError] = useState("");
  const [isGameOn, setIsGameOn] = useState(null);
  const [isCompleted, setIsCompleted] = useState(true);
  const [print, setPrint] = useState(false);

  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const res = await fetch("/api/game-status");
        if (!res.ok) throw new Error("Failed to fetch game status");
        const data = await res.json();
        if (data.isGameOn) {
          setIsGameOn(true);
        }
        if (data.targetDateTime) {
          setTargetTime(new Date(data.targetDateTime));
        } else {
          setError("No countdown date set.");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchTarget();
  }, []);
  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ text: "The game has ended!", isWarning: true });
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const isWarning = diff <= 10 * 60 * 1000; // less than 10 minutes
      setTimeLeft({ text: `${hours}h ${minutes}m ${seconds}s`, isWarning });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const validateEntry = (entry) => {
    const { num, str, rumble } = entry;

    // Allow completely empty row
    if (!num && !str && !rumble) return true;

    // Validate num: 1–3 digits
    if (!/^\d{1,3}$/.test(num)) return false;

    const numLength = num.length;
    const isStrValid = /^\d+$/.test(str);
    const isRumbleValid = /^\d+$/.test(rumble);

    if (numLength === 1) {
      // 1D: only str is allowed/required, rumble must be empty
      if (!isStrValid || rumble) return false;
    } else if (numLength === 2 || numLength === 3) {
      // 2D or 3D: allow at least one of str or rumble (or both)
      if (!str && !rumble) return false;
      if (str && !isStrValid) return false;
      if (rumble && !isRumbleValid) return false;
    } else {
      return false;
    }

    return true;
  };

  const autofillMiddleEntries = (inputs) => {
    const entriesWithSuffix = inputs
      .map((input, idx) => {
        if (!input?.num) return null;
        const hasStr = input.str !== undefined && input.str !== null;
        const hasRumble = input.rumble !== undefined && input.rumble !== null;
        if (!hasStr || !hasRumble) return null;

        return {
          index: idx,
          numLength: input.num.length,
          str: input.str,
          rumble: input.rumble,
        };
      })
      .filter(Boolean);

    if (entriesWithSuffix.length < 2) return inputs;

    for (let i = 0; i < entriesWithSuffix.length; i++) {
      for (let j = i + 1; j < entriesWithSuffix.length; j++) {
        const e1 = entriesWithSuffix[i];
        const e2 = entriesWithSuffix[j];

        const isSameLength = e1.numLength === e2.numLength;
        const isSameStr = e1.str === e2.str;
        const isSameRumble = e1.rumble === e2.rumble;

        if (isSameLength && isSameStr && isSameRumble) {
          for (let k = e1.index + 1; k < e2.index; k++) {
            const cur = inputs[k];
            if (!cur?.num || cur.str || cur.rumble) continue;
            if (cur.num.length !== e1.numLength) continue;

            inputs[k] = {
              ...cur,
              str: e1.str,
              rumble: e1.rumble,
            };
          }
        }
      }
    }

    return inputs;
  };
  const calculateTotals = (entries) => {
    let total1D = 0,
      total2D = 0,
      total3D = 0;

    entries.forEach(({ num, str, rumble }) => {
      const total = (Number(str) || 0) + (Number(rumble) || 0);

      if (/^\d$/.test(num)) {
        total1D += total;
      } else if (/^\d{2}$/.test(num)) {
        total2D += total;
      } else if (/^\d{3}$/.test(num)) {
        total3D += total;
      }
    });

    return { OneD: total1D, TwoD: total2D, ThreeD: total3D };
  };
  const handleSavePlayer = () => {
    const filledInputs = autofillMiddleEntries(inputs); // ✨ autofill logic applied here

    const newErrors = filledInputs.map((entry) => {
      const isValid = validateEntry(entry);
      const isEmpty = !entry.num && !entry.str && !entry.rumble;

      return isEmpty
        ? { num: false, str: false, rumble: false }
        : !isValid
        ? { num: true, str: true, rumble: true }
        : { num: false, str: false, rumble: false };
    });

    setErrors(newErrors);

    const hasErrors = newErrors.some((err) =>
      Object.values(err).some((v) => v)
    );

    if (hasErrors) return;

    const validEntries = inputs.filter((entry) => {
      const isValid = validateEntry(entry);
      const isEmpty = !entry.num && !entry.str && !entry.rumble;
      return isValid && !isEmpty;
    });

    const newEntries = validEntries.map((entry, i) => ({
      id: Date.now() + i,
      serial: i + 1,
      input: entry,
      isEditing: false,
      editValue: { ...entry },
      editError: false,
    }));

    const voucher = `${gamerId}-${Math.floor(
      100000 + Math.random() * 90000000
    )}`;
    const totals = calculateTotals(validEntries);

    const newPlayer = {
      name,
      agentId: agent.agentId,
      time: new Date().toLocaleString(),
      voucher,
      data: newEntries,
    };
    setShowInput(false);
    setPlayers([newPlayer]);
    setAmountPlayed(totals);
    setName("");
    setInputs(Array(20).fill({ num: "", str: "", rumble: "" }));
    setErrors(Array(20).fill({ num: false, str: false, rumble: false }));
  };
  const handleAddInputs = () => {
    setInputs([...inputs, ...Array(20).fill({ num: "", str: "", rumble: "" })]);
    setErrors([
      ...errors,
      ...Array(20).fill({ num: false, str: false, rumble: false }),
    ]);
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

  const handleEditChange = (playerIdx, entryIdx, field, value) => {
    setPlayers(
      players.map((player, i) =>
        i === playerIdx
          ? {
              ...player,
              data: player.data.map((entry, j) =>
                j === entryIdx
                  ? {
                      ...entry,
                      editValue: {
                        ...entry.editValue,
                        [field]: value,
                      },
                      editError: false,
                    }
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

    const updatedPlayers = players.map((player, i) =>
      i === playerIdx
        ? {
            ...player,
            data: player.data.map((e, j) =>
              j === entryIdx
                ? {
                    ...e,
                    input: { ...e.editValue },
                    isEditing: false,
                    editError: false,
                  }
                : e
            ),
          }
        : player
    );

    setPlayers(updatedPlayers);

    const allInputs = updatedPlayers[playerIdx].data.map((e) => e.input);
    setAmountPlayed(calculateTotals(allInputs));
  };
  const handleDelete = (playerIdx, entryIdx) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirmDelete) return;

    const updatedPlayers = players.map((player, i) =>
      i === playerIdx
        ? {
            ...player,
            data: player.data.filter((_, j) => j !== entryIdx),
          }
        : player
    );

    setPlayers(updatedPlayers);

    const allInputs = updatedPlayers[playerIdx].data.map((e) => e.input);
    setAmountPlayed(calculateTotals(allInputs));
  };

  const handleSubmitAndPrint = async (player) => {
    if (submittingVoucher === player.voucher) return; // prevent double click

    setSubmittingVoucher(player.voucher); // disable button instantly

    try {
      // ✅ your submission logic
      const statusRes = await fetch("/api/game-status");
      const statusData = await statusRes.json();
      const now = new Date();
      const targetTime = statusData.targetDateTime
        ? new Date(statusData.targetDateTime)
        : null;

      if (!statusData.isGameOn || (targetTime && now > targetTime)) {
        alert("⛔ The game has ended or the time is up");
        return;
      }

      const dataEntries = player.data || [];
      const parsedData = dataEntries.map((entry) => ({ input: entry.input }));
      const totals = calculateTotals(dataEntries.map((e) => e.input));

      if (totals.OneD === 0 && totals.TwoD === 0 && totals.ThreeD === 0) {
        alert("⚠️ Player has entries, but total amount is zero.");
        return;
      }

      const payload = {
        voucher: player.voucher,
        agentId: agent.agentId,
        gamerId,
        agentName: agent.name,
        name: player.name || "",
        data: parsedData,
        amountPlayed: totals,
        cPercentages: agent.cPercentages,
        percentages: agent.percentages,
      };

      const res = await fetch("/api/saveGamePlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("✅ Player submitted!");
        setShowInput(true);

        setPlayers((prev) =>
          prev.map((p) =>
            p.voucher === player.voucher ? { ...p, submitted: true } : p
          )
        );
        fetchEntryCount(gamerId);
      } else {
        const err = await res.json();
        alert(`❌ Failed to submit: ${err.message || res.status}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ Network or server error.");
    } finally {
      setSubmittingVoucher(null); // ✅ allow next submit
    }
  };

  /**
   * Handles submitting player data to a "waiting" collection when the game is closed.
   * @param {object} player - The player data object.
   * @param {boolean} isGameOn - Current game status.
   * @param {Date | null} targetTime - The game end time, if set.
   */

  const handlePrint = async (player, amountPlayed) => {
    if (typeof window === "undefined") return;

    const secret = "thai-lottery-secret-key";
    const payload = {
      voucher: player.voucher,
      time: player.time,
      amount: player.amountPlayed,
      entries: player.data.map((d) => d.input),
    };

    const encrypted = AES.encrypt(JSON.stringify(payload), secret).toString();
    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(encrypted);
    } catch (err) {
      console.error("QR code generation failed:", err);
      alert("❌ Failed to generate QR code.");
      return;
    }

    const calculateDeduction = (amount, percent) =>
      (amount * ((100 - percent) / 100)).toFixed(1);

    const formatDataRows = (dataArray) => {
      const sortedData = [...dataArray].sort(
        (a, b) => b.input.num.length - a.input.num.length
      );
      const half = Math.ceil(sortedData.length / 2);
      const col1 = sortedData.slice(0, half);
      const col2 = sortedData.slice(half);

      const rows = [];
      for (let i = 0; i < Math.max(col1.length, col2.length); i++) {
        const c1 = col1[i]?.input || {};
        const c2 = col2[i]?.input || {};
        rows.push(`
        <tr>
          <td>${c1.num || ""}</td><td>${c1.str || ""}</td><td>${
          c1.rumble || ""
        }</td><td></td>
          <td>${c2.num || ""}</td><td>${c2.str || ""}</td><td>${
          c2.rumble || ""
        }</td>
        </tr>
      `);
      }
      return rows.join("");
    };

    const printedAt = new Date().toLocaleString();

    const htmlContent = `
    <html>
      <head>
        <title>Player Voucher</title>
        <style>
          @page { margin: 0; }
          body {
            width: 80mm;
            font-family: Arial, sans-serif, Hind Siliguri;
   
 


            font-size: 16px;
            padding: 4px;
            margin: 0;
            color: #000;
          }
             .banglaText {
    font-family: var(--font-bangla);
    font-size: 16pt;
    font-weight: 700;
  }
          .container { width: 100%; }
          h2, p { font-size: 16px; text-align: center; margin: 2px 0; }
          h1 { font-size: 20px; text-align: center; margin: 2px 0; }
          .input-table, .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
          }
          .input-table th, .input-table td,
          .totals-table th, .totals-table td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            font-size: 16px;
          }
          .grand-total { font-weight: bold; }
          .first-container {
            border: 1px solid #000;
            padding: 4px;
            margin-bottom: 4px;
          }
          .qr-code {
            display: flex;
            justify-content: center;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="first-container">
            <h1 class="banglaText">নসীব ৭৮৬</h1>
            <h2>${new Date(player.time).toLocaleString()}</h2>
            <h1>${player.voucher || ""}</h1>
            <p>Player: ${player.name || ""}</p>
          </div>

          <table class="input-table">
            <thead>
              <tr>
                <th>Num</th><th>Str</th><th>Rum.</th><th></th>
                <th>Num</th><th>Str</th><th>Rum.</th>
              </tr>
            </thead>
            <tbody>
              ${formatDataRows(player.data)}
            </tbody>
          </table>

          <table class="totals-table">
            <thead>
              <tr><th>Category</th><th>Amount</th><th>After Deduction</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>3D Total</td>
                <td>${amountPlayed.ThreeD}</td>
                <td>${calculateDeduction(
                  amountPlayed.ThreeD,
                  agent.cPercentages.threeD
                )}</td>
              </tr>
              <tr>
                <td>2D Total</td>
                <td>${amountPlayed.TwoD}</td>
                <td>${calculateDeduction(
                  amountPlayed.TwoD,
                  agent.cPercentages.twoD
                )}</td>
              </tr>
              <tr>
                <td>1D Total</td>
                <td>${amountPlayed.OneD}</td>
                <td>${calculateDeduction(
                  amountPlayed.OneD,
                  agent.cPercentages.oneD
                )}</td>
              </tr>
              <tr class="grand-total">
                <td colspan="2">Grand Total</td>
                <td>${(
                  (amountPlayed.ThreeD * (100 - agent.cPercentages.threeD)) /
                    100 +
                  (amountPlayed.TwoD * (100 - agent.cPercentages.twoD)) / 100 +
                  (amountPlayed.OneD * (100 - agent.cPercentages.oneD)) / 100
                ).toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 24px; text-align: center;">
          <p style="margin-bottom: 12px; font-size: 14px; line-height: 1.5;">
            ✍️  Agent Signature
          </p>
         <div style="
            display: inline-block;
            width: 200px;
            height: 60px;
            vertical-align: top;
            background-color: #e5e5e5;
            border: 1px solid #ccc;
            box-sizing: border-box;
          "></div>
        </div>
          
           
        </div>
        <p style="
           margin-top: 10px, text-align:center;
          ">ভিজিট করুন</p>
<h2 style="
           margin-top: 6px;
          ">https://noshib786.com/history</h2>

      </body>
    </html>
  `;

    const win = window.open("", "_blank");
    win.document.write(htmlContent);
    win.document.close();

    // Wait for the QR image to load before printing
    win.onload = () => {
      const qrImg = win.document.querySelector("img");
      if (qrImg && !qrImg.complete) {
        qrImg.onload = () => win.print();
      } else {
        win.print();
      }
    };
  };
  const handlePlayerDownloadPdf = async (voucher) => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = playerRefs.current[voucher]?.current; // get the correct ref element
    if (element) {
      const options = {
        margin: 10,
        filename: `${voucher}.${agent?.name}.${gamerId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          background: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      html2pdf().set(options).from(element).save();
    } else {
      console.error("Content div not found for voucher:", voucher);
    }
  };
  return (
    <div className="min-h-screen  text-white p-6 ">
      <div
        className={`max-w-xl font-bangla mx-auto mb-10 px-6 py-4 rounded-2xl  text-4xl tracking-widest transition duration-500 bg-gradient-to-r from-purple-800 via-pink-600 to-blue-500 text-yellow-200 shadow-md shadow-pink-400/30 ${
          timeLeft.isWarning
            ? "bg-gradient-to-r from-red-700 to-yellow-500 text-white animate-pulse shadow-lg shadow-yellow-400/50"
            : ""
        }`}
      >
        ⏳<span className="font-bangla ">সময় বাকি :</span>{" "}
        <span className="font-bold">{timeLeft.text}</span>
      </div>
      <div className="max-w-3xl mx-auto bg-gray-900 bg-opacity-90 rounded-lg ring-2 ring-pink-500 shadow-2xl p-6">
        {showInput && (
          <>
            <div className="relative max-w-sm mx-auto mb-5 text-center font-2xl font-bangla  bg-gradient-to-r from-black via-gray-800 to-purple-900 text-yellow-300 font-bold px-10 py-6 rounded-full shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 tracking-widest text-2xl uppercase glow-animation">
              নসীব ৭৮৬ ভাউচার
            </div>
            {/* <button
              onClick={handleSavePlayer}
              className="block bg-pink-300 hover:bg-pink-500 text-black font-bold py-2 px-4 rounded mx-auto mb-10"
            >
              🎲 COMPLETE
            </button> */}
            <label className="block mb-2 text-pink-300 ">Player Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 mb-4 rounded bg-black border-2 border-pink-600 text-white"
            />
            <label className="block mb-2 text-pink-300">Enter Plays:</label>
            {inputs.map((entry, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-2 mb-2">
                {["num", "str", "rumble"].map((field, colIndex) => {
                  const flatIndex = rowIndex * 3 + colIndex;
                  const value = entry[field];
                  const error = errors[rowIndex]?.[field];

                  return (
                    <input
                      key={field}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]+"
                      value={value}
                      onChange={(e) => {
                        const updated = [...inputs];
                        updated[rowIndex] = {
                          ...updated[rowIndex],
                          [field]: e.target.value,
                        };
                        setInputs(updated);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const next = document.querySelector(
                            `input[name="input-${flatIndex + 1}"]`
                          );
                          if (next) next.focus();
                        }
                      }}
                      placeholder={field.toUpperCase()}
                      className={`w-full p-2 rounded bg-black border-2  ${
                        error
                          ? "border-red-500 bg-white text-black"
                          : "border-pink-600 text-white"
                      }`}
                      name={`input-${flatIndex}`}
                    />
                  );
                })}
              </div>
            ))}
            {errors.some((err) => Object.values(err).some((v) => v)) && (
              <p className="text-red-400">Please correct the errors.</p>
            )}
            {/* <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={handleAddInputs}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded"
              >
                ➕ Add More
              </button>
            </div> */}
            <div
              className="fixed right-6 bottom-8 z-50 flex flex-col items-center gap-3"
              style={{ pointerEvents: "auto" }}
            >
              <button
                onClick={handleSavePlayer}
                title="Complete"
                aria-label="Complete"
                className="w-16 h-16 rounded-full text-3xl bg-pink-300 hover:bg-pink-500 text-black font-bold flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
              >
                🎲
              </button>

              <button
                onClick={handleAddInputs}
                title="Add more plays"
                aria-label="Add more plays"
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 text-black font-bold flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
              >
                ➕
              </button>
            </div>
          </>
        )}

        {players.length > 0 && (
          <div className="mt-8 max-w-4xl mx-auto space-y-6">
            <h3 className="text-2xl text-yellow-400 mb-4 font-semibold text-center">
              🎉 Player Summary 🎉
            </h3>
            {players.forEach((player) => {
              if (!playerRefs.current[player.voucher]) {
                playerRefs.current[player.voucher] = React.createRef();
              }
            })}

            {players.map((player, playerIdx) => (
              <React.Fragment key={playerIdx}>
                <div
                  ref={playerRefs.current[player.voucher]}
                  className="my-16 bg-gray-800 p-5 rounded-xl border border-yellow-500 shadow hover:shadow-yellow-500 transition-shadow"
                >
                  <div className="fixed right-6 bottom-8 z-50 flex flex-col items-center gap-3">
                    {player.submitted ? (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            handlePlayerDownloadPdf(player.voucher)
                          }
                          className="bg-white w-14 h-14 flex items-center justify-center rounded shadow"
                        >
                          <img
                            src="/download.svg"
                            alt="Download"
                            className="w-8 h-8"
                          />
                        </button>

                        <button
                          onClick={() => handlePrint(player, amountPlayed)}
                          className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 text-black font-bold flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
                        >
                          🖨️
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSubmitAndPrint(player)}
                        disabled={submittingVoucher === player.voucher}
                        className="w-12 h-12 rounded-full text-3xl bg-green-500 hover:bg-green-600 text-black font-bold flex items-center justify-center shadow-lg transform transition-transform hover:scale-105"
                        aria-label={
                          submittingVoucher === player.voucher
                            ? "Submitting"
                            : "Submit"
                        }
                      >
                        {submittingVoucher === player.voucher ? "⏳" : "✅"}
                        <span className="sr-only">
                          {submittingVoucher === player.voucher
                            ? "Submitting..."
                            : "Submit"}
                        </span>
                      </button>
                    )}
                  </div>
                  <div className=" w-max sm:w-2/3 mx-auto border-collapse flex justify-between items-start">
                    <p className="text-yellow-300 font-bold sm:text-2xl  text-center my-5">
                      Voucher:{" "}
                      <span className="font-mono">
                        {player.voucher || "N/A"}
                      </span>
                    </p>
                  </div>
                  <div className=" w-max sm:w-2/3 mx-auto border-collapse flex justify-between items-start">
                    <div>
               
                      <h4 className="text-xl font-bold mb-1">
                        Player name: {player.name}
                      </h4>

                      <p className="text-gray-400 text-sm mb-1">
                        Time: {new Date(player.time).toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Entries: {player.data.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 overflow-x-auto w-full">
                    <table className=" w-max sm:w-2/3 mx-auto  border-collapse font-mono text-sm text-yellow-300">
                      <thead>
                        <tr className="bg-yellow-600 text-white">
                          <th className="border px-3 py-2 text-left">#</th>
                          <th className="border px-3 py-2 text-center">
                            Number
                          </th>
                          <th className="border px-3 py-2 text-center">STR</th>
                          <th className="border px-3 py-2 text-center">
                            RUMBLE
                          </th>
                          <th className="border px-3 py-2 text-center">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...player.data]
                          .map((entry, originalIdx) => ({
                            ...entry,
                            originalIdx,
                          }))
                          .sort((a, b) => {
                            const lengthA = String(a.input.num).length || 0;
                            const lengthB = String(b.input.num).length || 0;
                            return lengthB - lengthA;
                          })
                          .map((entry, sortedIdx) => (
                            <tr
                              key={entry.id}
                              className={
                                sortedIdx % 2 === 0
                                  ? "bg-gray-700"
                                  : "bg-gray-800"
                              }
                            >
                              <td className="border px-3 py-1 text-white">
                                {sortedIdx + 1}
                              </td>

                              {entry.isEditing ? (
                                <>
                                  {["num", "str", "rumble"].map((field) => (
                                    <td
                                      key={field}
                                      className="border px-2 py-1 "
                                    >
                                      <input
                                        type="text"
                                        value={entry.editValue[field]}
                                        onChange={(e) =>
                                          handleEditChange(
                                            playerIdx,
                                            entry.originalIdx,
                                            field,
                                            e.target.value
                                          )
                                        }
                                        className={`w-full p-1 bg-black border-2 text-white rounded ${
                                          entry.editError
                                            ? "border-red-500"
                                            : "border-yellow-400"
                                        }`}
                                        placeholder={field}
                                      />
                                    </td>
                                  ))}
                                </>
                              ) : (
                                <>
                                  <td className="border px-3 py-1 ">
                                    {entry.input.num}
                                  </td>
                                  <td className="border px-3 py-1 text-green-400">
                                    {entry.input.str}
                                  </td>
                                  <td className="border px-3 py-1 text-green-400">
                                    {entry.input.rumble}
                                  </td>
                                </>
                              )}

                              <td className="border px-3 py-1 space-x-2 flex items-center justify-center">
                                {entry.isEditing ? (
                                  <button
                                    onClick={() =>
                                      handleSaveEdit(
                                        playerIdx,
                                        entry.originalIdx
                                      )
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition"
                                  >
                                    💾
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleEdit(playerIdx, entry.originalIdx)
                                    }
                                    className="bg-white hover:bg-green-600 text-black py-1 px-2 rounded transition"
                                  >
                                    ✏️
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleDelete(playerIdx, entry.originalIdx)
                                  }
                                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded transition"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Totals Calculation */}
                  <div className="mt-6 overflow-x-auto w-full">
                    <table className=" w-max mx-auto sm:w-2/3 border-collapse font-mono text-sm text-yellow-300">
                      <thead>
                        <tr className="bg-red-700 text-white">
                          <th className="border border-gray-600 px-4 py-2 text-left">
                            Category
                          </th>
                          <th className="border border-gray-600 px-4 py-2 text-left">
                            Amount
                          </th>
                          <th className="border border-gray-600 px-4 py-2 text-left">
                            After Deduction
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-800">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 3D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.ThreeD?.toFixed(1) || "0"}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(
                              (amountPlayed?.ThreeD || 0) *
                              ((100 - (agent?.cPercentages?.threeD || 0)) / 100)
                            ).toFixed(1)}
                          </td>
                        </tr>

                        <tr className="bg-gray-900">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 2D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.TwoD?.toFixed(1) || "0"}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(
                              (amountPlayed?.TwoD || 0) *
                              ((100 - (agent?.cPercentages?.twoD || 0)) / 100)
                            ).toFixed(1)}
                          </td>
                        </tr>

                        <tr className="bg-gray-800">
                          <td className="border border-gray-600 px-4 py-2">
                            🎯 1D Total
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {amountPlayed?.OneD?.toFixed(1) || "0"}
                          </td>
                          <td className="border border-gray-600 px-4 py-2 text-green-400">
                            {(
                              (amountPlayed?.OneD || 0) *
                              ((100 - (agent?.cPercentages?.oneD || 0)) / 100)
                            ).toFixed(1)}
                          </td>
                        </tr>

                        <tr className="bg-gray-900 font-bold text-lg">
                          <td
                            colSpan={2}
                            className="border border-gray-600 px-4 py-2"
                          >
                            🔢 Grand Total
                          </td>
                          {/* <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                            {(
                              (amountPlayed?.ThreeD || 0) +
                              (amountPlayed?.TwoD || 0) +
                              (amountPlayed?.OneD || 0)
                            ).toFixed(1)}
                          </td> */}
                          <td className="border border-gray-600 px-4 py-2 text-yellow-300">
                            {(
                              ((amountPlayed?.ThreeD || 0) *
                                (100 - (agent?.cPercentages?.threeD || 0))) /
                                100 +
                              ((amountPlayed?.TwoD || 0) *
                                (100 - (agent?.cPercentages?.twoD || 0))) /
                                100 +
                              ((amountPlayed?.OneD || 0) *
                                (100 - (agent?.cPercentages?.oneD || 0))) /
                                100
                            ).toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Horizontal animated divider between players (except after last) */}
                {playerIdx !== players.length - 1 && (
                  <div className="h-2 w-full my-12 bg-gradient-to-r from-pink-500 via-yellow-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)] animate-pulse" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
