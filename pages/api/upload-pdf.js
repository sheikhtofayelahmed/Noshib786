import clientPromise from "lib/mongodb";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const busboy = require("busboy");
  const bb = busboy({ headers: req.headers });

  let pdfBuffer;
  let agentId;

  bb.on("file", (_, file) => {
    const chunks = [];
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("end", () => {
      pdfBuffer = Buffer.concat(chunks);
    });
  });

  bb.on("field", (fieldname, val) => {
    if (fieldname === "agentId") agentId = val;
  });

  bb.on("finish", async () => {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery");
    await db.collection("pdfs").insertOne({
      agentId,
      createdAt: new Date(),
      pdf: pdfBuffer,
    });
    res.status(200).json({ success: true });
  });

  req.pipe(bb);
}
