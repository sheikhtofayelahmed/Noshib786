'use client';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';

const AgentGames = ({ params }) => {
  const agentId = params.agentId;

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState('');

  const fetchGames = async (agentId) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/getPlayersByAgentId', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (res.ok) {
        setPlayers(data.players || []);
      } else {
        setError(data.message || 'Failed to fetch games');
      }
    } catch {
      setError('Failed to fetch games');
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    if (agentId) {
      fetchGames(agentId);
    }
  }, [agentId]);

  const totalAmounts = players.reduce(
    (acc, player) => {
      acc.ThreeD += player.amountPlayed?.ThreeD || 0;
      acc.TwoD += player.amountPlayed?.TwoD || 0;
      acc.OneD += player.amountPlayed?.OneD || 0;
      return acc;
    },
    { ThreeD: 0, TwoD: 0, OneD: 0 }
  );

  const grandTotal = totalAmounts.ThreeD + totalAmounts.TwoD + totalAmounts.OneD;

  return (
    <div className="flex h-screen bg-gray-900 text-white">
    

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-gray-800 px-6 py-4 shadow-md">
          <h2 className="text-3xl font-semibold text-yellow-300">🎮 Games by Agent: <span className="text-yellow-100">{agentId}</span></h2>
          {/* You can add user profile or logout button here */}
        </header>

        {/* Content area */}
        <section className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading && <p className="text-yellow-300 text-lg">⏳ Loading...</p>}
          {error && <p className="text-red-500 text-lg">❌ {error}</p>}

          {!loading && fetched && players.length === 0 && (
            <p className="text-pink-400 text-2xl text-center">😕 No player data found for this agent.</p>
          )}

          {!loading && players.length > 0 && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-yellow-500 transition-shadow">
                  <h3 className="text-green-400 font-semibold mb-2">🎯 3D Total</h3>
                  <p className="text-3xl font-bold">{totalAmounts.ThreeD.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-green-400 transition-shadow">
                  <h3 className="text-green-400 font-semibold mb-2">🎯 2D Total</h3>
                  <p className="text-3xl font-bold">{totalAmounts.TwoD.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-green-400 transition-shadow">
                  <h3 className="text-green-400 font-semibold mb-2">🎯 1D Total</h3>
                  <p className="text-3xl font-bold">{totalAmounts.OneD.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-600 p-6 rounded-lg shadow-lg">
                  <h3 className="font-semibold mb-2 text-black">🔢 Grand Total</h3>
                  <p className="text-3xl font-bold text-black">{grandTotal.toFixed(2)}</p>
                </div>
              </div>

              {/* Player Summary */}
              <div>
                <h3 className="text-2xl text-yellow-400 font-semibold mb-6">🎉 Player Summary 🎉</h3>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                  {players.map((player, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg shadow p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold mb-1">{player.name}</h4>
                          <p className="text-yellow-300">Voucher: <span className="font-mono">{player.voucher || 'N/A'}</span></p>
                          <p className="text-gray-400 text-sm">Time: {new Date(player.time).toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">Entries: {player.entries.length}</p>
                        </div>
                        <button
                          onClick={() => window.print()}
                          className="py-2 px-4 rounded bg-purple-600 hover:bg-purple-700 transition"
                          title="Print Player Info"
                        >
                          🖨️ Print
                        </button>
                      </div>

                      {/* Entries Table */}
                      <table className="w-full border-collapse text-sm font-mono rounded overflow-hidden">
                        <thead>
                          <tr className="bg-yellow-600 text-black">
                            <th className="border px-3 py-2 text-left">#</th>
                            <th className="border px-3 py-2 text-left">Input</th>
                          </tr>
                        </thead>
                        <tbody>
                          {player.entries.map((entry, entryIdx) => (
                            <tr
                              key={entryIdx}
                              className={entryIdx % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'}
                            >
                              <td className="border px-3 py-2">{entryIdx + 1}</td>
                              <td className="border px-3 py-2">{entry.input}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Player Amount Summary */}
                      <div className="mt-4">
                        <table className="w-full border-collapse font-mono text-sm rounded overflow-hidden">
                          <thead>
                            <tr className="bg-red-700 text-white">
                              <th className="border px-4 py-2 text-left">Category</th>
                              <th className="border px-4 py-2 text-left">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-gray-800">
                              <td className="border px-4 py-2">🎯 3D Total</td>
                              <td className="border px-4 py-2 text-green-400">{player.amountPlayed?.ThreeD || 0}</td>
                            </tr>
                            <tr>
                              <td className="border px-4 py-2">🎯 2D Total</td>
                              <td className="border px-4 py-2 text-green-400">{player.amountPlayed?.TwoD || 0}</td>
                            </tr>
                            <tr className="bg-gray-800">
                              <td className="border px-4 py-2">🎯 1D Total</td>
                              <td className="border px-4 py-2 text-green-400">{player.amountPlayed?.OneD || 0}</td>
                            </tr>
                            <tr className="bg-gray-900 font-bold text-lg">
                              <td className="border px-4 py-2">🔢 Grand Total</td>
                              <td className="border px-4 py-2 text-yellow-300">
                                {(
                                  (player.amountPlayed?.ThreeD || 0) +
                                  (player.amountPlayed?.TwoD || 0) +
                                  (player.amountPlayed?.OneD || 0)
                                ).toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AgentGames;
