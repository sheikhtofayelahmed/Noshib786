import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  // Ensure method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { agentId, name, time, data } = req.body;

  // Validate incoming payload
  if (!agentId || !name || !time || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  try {
    // Connect to the MongoDB client
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");  // You can specify the database name here

    // Prepare the entries (same format as before)
    const entries = data
      .map(entry => {
        const [number, straight, rumbo] = entry.input.split('=');
        // Skip invalid entries that don't follow the proper format
        if (!number || !straight || !rumbo) return null;

        return {
          number,
          straight: parseInt(straight, 10) || 0,
          rumbo: parseInt(rumbo, 10) || 0,
        };
      })
      .filter(entry => entry !== null);  // Remove null entries

    // If no valid entries, return an error response
    if (entries.length === 0) {
      return res.status(400).json({ message: 'No valid entries to save' });
    }

    // Insert player data along with the entries in a single document
    const playerResult = await db.collection('playersInput').insertOne({
      agentId,
      name,
      time: new Date(time), // Ensure time is in valid Date format
      entries, // Embed entries inside the player document
    });

    // Send success response
    res.status(200).json({ message: 'Player and entries saved successfully', playerId: playerResult.insertedId });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
