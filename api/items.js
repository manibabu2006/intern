import db from './_db';

export default async function handler(req, res) {
  const { item_name, category, location, price } = req.body;
  await db.query(
    'INSERT INTO items (item_name, category, location, price) VALUES (?,?,?,?)',
    [item_name, category, location, price]
  );
  res.json({ success: true });
}
