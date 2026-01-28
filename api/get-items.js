import db from './_db';

export default async function handler(req, res) {
  const [rows] = await db.query('SELECT * FROM items');
  res.json(rows);
}
