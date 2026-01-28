import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { action } = req.body;

    // ✅ ADD ITEM
    if (action === "addItem") {
      const { name, price, owner_id } = req.body;

      if (!name || !price || !owner_id) {
        return res.status(400).json({ message: "Missing data" });
      }

      await db.execute(
        "INSERT INTO items (name, price, owner_id) VALUES (?, ?, ?)",
        [name, price, owner_id]
      );

      return res.json({ message: "Item added successfully" });
    }

    // ✅ GET ITEMS (CUSTOMER)
    if (action === "getItems") {
      const [rows] = await db.execute(
        "SELECT * FROM items"
      );
      return res.json(rows);
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
