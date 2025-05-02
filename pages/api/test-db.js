import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('test'); // or your actual DB name
    const collections = await db.listCollections().toArray();

    res.status(200).json({
      message: 'Connected to MongoDB!',
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Failed to connect to MongoDB', error: error.message });
  }
}
