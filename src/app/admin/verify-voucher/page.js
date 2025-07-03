"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
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
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices.length === 0) {
          setError("❌ No camera device found.");
          return;
        }

        const backCamera =
          devices.find((d) => d.label.toLowerCase().includes("back")) ||
          devices[0];

        html5QrCode
          .start(
            backCamera.id,
            { fps: 10, qrbox: 250 },
            (decodedText) => {
              html5QrCode.stop();
              const decrypted = decryptVoucher(decodedText);
              if (decrypted) {
                setScannedData(decrypted);
                setError("");
              } else {
                setError("❌ Invalid or tampered QR code.");
                setScannedData(null);
              }
            },
            (scanError) => {
              console.warn("Scan error:", scanError);
            }
          )
          .catch((err) => {
            console.error("Camera start failed:", err);
            setError("⚠️ Camera access denied or unavailable.");
          });

        qrRef.current = html5QrCode;
      })
      .catch((err) => {
        console.error("Camera listing failed:", err);
        setError("⚠️ Could not access camera devices.");
      });

    return () => {
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto text-white bg-gray-900 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        🔍 Scan QR Voucher
      </h2>

      <div
        id="qr-reader"
        className="w-full aspect-square border border-gray-700 rounded-md overflow-hidden"
      ></div>

      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      {scannedData && (
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">
            ✅ Voucher Details
          </h3>
          <p>
            <strong>Voucher:</strong> {scannedData.voucher}
          </p>
          <p>
            <strong>Time:</strong> {new Date(scannedData.time).toLocaleString()}
          </p>
          <ul className="ml-4 list-disc">
            <li>1D: {scannedData.amount.OneD}</li>
            <li>2D: {scannedData.amount.TwoD}</li>
            <li>3D: {scannedData.amount.ThreeD}</li>
            <li>Total: {scannedData.amount.total}</li>
          </ul>
          <p className="mt-2">
            <strong>Entries:</strong> {scannedData.entries.length} numbers
          </p>
        </div>
      )}
    </div>
  );
}
