import clientPromise from "/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");

    const collectionExists = await db
      .listCollections({ name: "summaries" })
      .hasNext();

    if (!collectionExists) {
      return res
        .status(404)
        .json({ message: "Collection 'summaries' not found" });
    }

    await db.collection("summaries").drop();

    return res
      .status(200)
      .json({ message: "Collection 'summaries' deleted successfully" });
  } catch (error) {
    console.error("Delete collection error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
