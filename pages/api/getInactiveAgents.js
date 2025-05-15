import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('thai-agent-lottery');

    const inactiveAgents = await db.collection('agents').find({ active: false }).toArray();

    const cleaned = inactiveAgents.map(({ _id, ...rest }) => ({
      ...rest,
      id: _id.toString(),
    }));

    res.status(200).json({ agents: cleaned });
  } catch (error) {
    console.error('Fetch inactive agents error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
