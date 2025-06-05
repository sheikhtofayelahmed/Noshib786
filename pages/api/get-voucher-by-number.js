import clientPromise from "../../lib/mongodb"; // Adjust path if necessary

export default async function handler(req, res) {
  // Only allow GET requests for this API
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  const { voucherNumber } = req.query;

  // Basic validation for the voucherNumber
  if (!voucherNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Voucher number is required." });
  }

  try {
    const client = await clientPromise;
    const db = client.db("thai-agent-lottery"); // Specify your database name
    const collection = db.collection("playersInput"); // Specify your collection name

    // Find the voucher data by the voucher number
    const voucherData = await collection.findOne({ voucher: voucherNumber });
    console.log(voucherData, "from api");

    if (voucherData) {
      // If data is found, return it
      res.status(200).json({ success: true, voucherData: voucherData });
    } else {
      // If no data found for the given voucher number
      res.status(404).json({
        success: false,
        message: `Voucher '${voucherNumber}' not found.`,
      });
    }
  } catch (error) {
    console.error("Error fetching voucher data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
