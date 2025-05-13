'use client'
import Navigation from '@/components/Navigation';
import { AgentProvider, useAgent } from '@/context/AgentContext';
import { useEffect, useState } from 'react';

const Reports = () => {
    const [loading, setLoading] = useState(true);      // NEW
const [fetched, setFetched] = useState(false);     // NEW
  const { agentId, logout } = useAgent(); // ✅ Move this inside the component

  const [players, setPlayers] = useState([]);

const fetchPlayersByAgentId = async (agentId) => {
  setLoading(true);
  setFetched(false);

  try {
    const res = await fetch('/api/getPlayersByAgentId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId }),
    });
    const data = await res.json();
    if (res.ok) {
      setPlayers(data.players);
    } else {
      console.error(data.message);
      setPlayers([]);
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
    setPlayers([]);
  } finally {
    setLoading(false);
    setFetched(true);
  }
};


  useEffect(() => {

    if (agentId) {
      fetchPlayersByAgentId(agentId);
    }
  }, [agentId]);


  return (
     <AgentProvider>


    
    <div className="p-4 text-white">
       
<Navigation


></Navigation>


    {loading && <p className="text-yellow-300 mt-6">⏳ Loading player data...</p>}

{!loading && fetched && players.length === 0 && (
  <div className="flex items-center justify-center h-[60vh]">
    <p className="text-pink-400 text-3xl font-bold text-center">
      😕 No player data found for this agent.
    </p>
  </div>
)}

{!loading && players.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl text-yellow-400 mb-4">🎉 Player Summary 🎉</h3>

          {players.map((player, idx) => {
            // const amountPlayed = calculateAmounts(player.entries);

            return (


                
              <div key={idx} className="mb-6 bg-gray-800 p-4 rounded">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-xl">{player.name}</h4>
                    <p>Time: {new Date(player.time).toLocaleString()}</p>
                    <p>Entries: {player.entries.length}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="py-2 px-4 rounded bg-purple-500 hover:bg-purple-600"
                  >
                    🖨️ Print
                  </button>
                </div>

                <table className="w-full mt-4 border-collapse">
                  <thead>
                    <tr>
                      <th className="border bg-yellow-600 text-black">#</th>
                      <th className="border bg-yellow-600 text-black">Input</th>
                    </tr>
                  </thead>
                  <tbody>
                    {player.entries.map((entry, entryIdx) => (
                      <tr key={entryIdx} className="odd:bg-gray-700 even:bg-gray-800">
                        <td className="border p-2">{entryIdx + 1}</td>
                        <td className="border p-2">{entry.input}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 text-yellow-300">
                  <table className="w-full border-collapse mt-4 font-mono text-sm">
                    <thead>
                      <tr className="bg-red-700 text-white">
                        <th className="border px-4 py-2">Category</th>
                        <th className="border px-4 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-gray-800">
                        <td className="border px-4 py-2">🎯 3D Total</td>
                        <td className="border px-4 py-2 text-green-400">{player.amountPlayed.ThreeD}</td>
                        
                      </tr>
                      <tr>
                        <td className="border px-4 py-2">🎯 2D Total</td>
                        <td className="border px-4 py-2 text-green-400">{player.amountPlayed.TwoD}</td>
                        
                      </tr>
                      <tr className="bg-gray-800">
                        <td className="border px-4 py-2">🎯 1D Total</td>
                        <td className="border px-4 py-2 text-green-400">{player.amountPlayed.OneD}</td>
                       
                      </tr>
                      <tr className="bg-gray-900 font-bold text-lg">
                        <td className="border px-4 py-2">🔢 Grand Total</td>
                        <td className="border px-4 py-2 text-yellow-300">
                          {(player.amountPlayed.ThreeD + player.amountPlayed.TwoD + player.amountPlayed.OneD).toFixed(2)}
                        </td>
                       
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
     </AgentProvider>
  );
};

export default Reports;
