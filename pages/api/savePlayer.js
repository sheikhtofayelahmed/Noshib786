import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  // Ensure method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { agentId, name, time, data } = req.body;
console.log(agentId, name, time, data )
  // Validate incoming payload
  if (!agentId || !time || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ message: 'Invalid payload, missing or malformed data' });
  }

  try {
    // Connect to the MongoDB client
    const client = await clientPromise;
    const db = client.db('thai-agent-lottery');  // Specify the database name

    // Ensure the entries are saved as is, without splitting
    const entries = data
      .map(entry => ({
        input: entry.input.trim(), // Trim to remove extra spaces
      }))
      .filter(entry => entry.input.length > 0);  // Remove any empty entries

    // If no valid entries, return an error
    if (entries.length === 0) {
      return res.status(400).json({ message: 'No valid entries to save' });
    }

    // Insert the player data along with the entries into the collection
    const playerResult = await db.collection('playersInput').insertOne({
      agentId,
      name,
      time: new Date(time),  // Convert the time to a proper Date object
      entries,  // Embed entries inside the player document
    });

    // Send success response
    return res.status(200).json({
      message: 'Player and entries saved successfully',
      playerId: playerResult.insertedId,
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
