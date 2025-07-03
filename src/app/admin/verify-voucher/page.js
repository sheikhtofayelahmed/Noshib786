"use client";

import { useState } from "react";
import AES from "crypto-js/aes";
import Utf8 from "crypto-js/enc-utf8";

const secret = "thai-lottery-secret-key";

const decryptVoucher = (encryptedString) => {
  try {
    const bytes = AES.decrypt(encryptedString, secret);
    const decrypted = bytes.toString(Utf8);
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
};

export default function VerifyVoucherPage() {
  const [inputText, setInputText] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const decrypted = decryptVoucher(inputText.trim());
    if (decrypted) {
      setScannedData(decrypted);
      setError("");
    } else {
      setScannedData(null);
      setError("❌ Invalid or tampered voucher.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto text-white bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        🔐 Enter Voucher Code
      </h2>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste voucher hash here..."
        className="w-full p-3 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white mb-4"
        rows={4}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
      >
        🔍 Verify Voucher
      </button>

      {error && <p className="text-red-400 text-center mt-4">{error}</p>}

      {scannedData && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">
            ✅ Voucher Details
          </h3>
          <p>
            <strong>Voucher:</strong> {scannedData.voucher}
          </p>
          <p>
            <strong>Time:</strong> {scannedData.time}
          </p>

          <p className="mt-2">
            <strong>Entries:</strong>
          </p>
          <table className="w-full text-left mt-2 border border-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 border border-gray-600">Number</th>
                <th className="px-4 py-2 border border-gray-600">Str</th>
                <th className="px-4 py-2 border border-gray-600">Rumble</th>
              </tr>
            </thead>
            <tbody>
              {scannedData.entries.map((entry, i) => (
                <tr key={i} className="border border-gray-600">
                  <td className="px-4 py-2 border border-gray-600">
                    {entry.num}
                  </td>
                  <td className="px-4 py-2 border border-gray-600">
                    {entry.str}
                  </td>
                  <td className="px-4 py-2 border border-gray-600">
                    {entry.rumble || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
