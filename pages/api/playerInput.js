import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('thai-agent-lottery'); // Replace with your actual DB name
    const collection = db.collection('players');

    const player = req.body;

    const result = await collection.insertOne(player);

    res.status(200).json({ message: 'Player saved!', insertedId: result.insertedId });
  } catch (error) {
    console.error('Error saving player:', error);
    res.status(500).json({ message: 'Failed to save player', error: error.message });
  }
}
