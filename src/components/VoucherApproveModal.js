import React, { useState } from "react";

const GamerDetailsModal = ({
  isOpen,
  onClose,
  gamerId,
  players,
  fetchCountsForGamers,
}) => {
  if (!isOpen || players.length === 0) return null;

  const totalAmountPlayed = players.reduce((sum, p) => {
    const pPercent = p.cPercentages || { threeD: 0, twoD: 0, oneD: 0 };

    const oneD = (p.amountPlayed?.OneD || 0) * (1 - pPercent.oneD / 100) || 0;
    const twoD = (p.amountPlayed?.TwoD || 0) * (1 - pPercent.twoD / 100) || 0;
    const threeD =
      (p.amountPlayed?.ThreeD || 0) * (1 - pPercent.threeD / 100) || 0;
    return sum + oneD + twoD + threeD;
  }, 0);

  async function approveVoucher(voucher) {
    try {
      const res = await fetch("/api/saveApproveInput", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gamerId, voucher }),
      });
      const data = await res.json();

      if (res.ok) {
        fetchCountsForGamers();
      }

      alert(data.message || "Action complete");
    } catch (err) {
      console.error("Error approving voucher:", err);
      alert("Failed to approve voucher");
    }
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 relative max-h-[80vh] overflow-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition text-2xl font-semibold"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800">
          Gamer: <span className="text-indigo-600">{gamerId}</span>
        </h2>

        {/* Total amount played */}
        <p className="mb-6 text-lg font-semibold text-gray-700 text-center">
          Total Amount Played:{" "}
          <span className="text-indigo-600">{totalAmountPlayed}</span>
        </p>

        {/* Player rows */}
        <div className="space-y-4">
          {players.map((player, index) => {
            const oneD = player.amountPlayed?.OneD || 0;
            const twoD = player.amountPlayed?.TwoD || 0;
            const threeD = player.amountPlayed?.ThreeD || 0;
            const total =
              (player.amountPlayed?.OneD || 0) *
                (1 - player.cPercentages.oneD / 100) +
              (player.amountPlayed?.TwoD || 0) *
                (1 - player.cPercentages.twoD / 100) +
              (player.amountPlayed?.ThreeD || 0) *
                (1 - player.cPercentages.threeD / 100);

            return (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    Voucher:{" "}
                    <span className="text-indigo-600">{player.voucher}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    1D: <span className="font-medium">{oneD}</span>, 2D:{" "}
                    <span className="font-medium">{twoD}</span>, 3D:{" "}
                    <span className="font-medium">{threeD}</span> | Total:{" "}
                    <span className="font-bold text-indigo-600">{total}</span>
                  </p>
                </div>
                <button
                  onClick={() => approveVoucher(player.voucher)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition shadow-md"
                >
                  Approve
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamerDetailsModal;
