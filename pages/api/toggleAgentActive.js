// pages/api/toggleAgentActive.js or src/app/api/toggleAgentActive/route.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { agentId, active } = req.body;
  if (!agentId || typeof active !== 'boolean') {
    return res.status(400).json({ message: 'Missing or invalid fields' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('thai-agent-lottery');

    const updated = await db.collection('agents').updateOne(
      { agentId },
      { $set: { active } }
    );

    if (updated.modifiedCount === 0) {
      return res.status(404).json({ message: 'Agent not found or no change' });
    }

    return res.status(200).json({ message: `Agent marked ${active ? 'active' : 'inactive'}` });
  } catch (error) {
    console.error('Toggle agent active error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
