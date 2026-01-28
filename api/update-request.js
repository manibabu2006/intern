import db from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { request_id, status } = req.body;

    if (!request_id || !['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    await db.query(
      `UPDATE requests SET status = ? WHERE id = ?`,
      [status, request_id]
    );

    res.json({ success: true, message: `Request ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
