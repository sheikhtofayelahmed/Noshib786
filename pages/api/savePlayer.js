import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, time, data } = req.body;

  if (!name || !time || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    // Save player
    const playerResult = await db.players.create({
      data: {
        name,
        time: new Date(time),
      },
    });

    const playerId = playerResult.id;

    // Parse and save entries
    const entries = data.map(entry => {
      const [number, straight, rumbo] = entry.input.split('=');
      return {
        player_id: playerId,
        number,
        straight: parseInt(straight, 10),
        rumbo: rumbo ? parseInt(rumbo, 10) : 0,
      };
    });

    // Bulk insert
    await db.player_entries.createMany({
      data: entries,
    });

    res.status(200).json({ message: 'Player and entries saved successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

