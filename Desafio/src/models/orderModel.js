const db = require('../database/db');

function createOrder(orderId, value, creationDate, items) {
  const insertOrderAndItems = db.transaction(() => {
    const insertOrder = db.prepare(`
      INSERT INTO "Order" (orderId, value, creationDate)
      VALUES (?, ?, ?)
    `);
    insertOrder.run(orderId, value, creationDate);

    const insertItem = db.prepare(`
      INSERT INTO Items (orderId, productId, quantity, price)
      VALUES (?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(orderId, item.productId, item.quantity, item.price);
    }
  });

  insertOrderAndItems();
  return getOrderById(orderId);
}

function getOrderById(orderId) {
  const order = db.prepare(`
    SELECT * FROM "Order" WHERE orderId = ?
  `).get(orderId);

  if (!order) return null;

  const items = db.prepare(`
    SELECT productId, quantity, price FROM Items WHERE orderId = ?
  `).all(orderId);

  return { ...order, items };
}

function getAllOrders() {
  const orders = db.prepare(`SELECT * FROM "Order"`).all();

  return orders.map((order) => {
    const items = db.prepare(`
      SELECT productId, quantity, price FROM Items WHERE orderId = ?
    `).all(order.orderId);
    return { ...order, items };
  });
}

function updateOrder(orderId, value, creationDate, items) {
  const order = getOrderById(orderId);
  if (!order) return null;

  const updateOrderAndItems = db.transaction(() => {
    db.prepare(`
      UPDATE "Order" SET value = ?, creationDate = ? WHERE orderId = ?
    `).run(value, creationDate, orderId);

    db.prepare(`DELETE FROM Items WHERE orderId = ?`).run(orderId);

    const insertItem = db.prepare(`
      INSERT INTO Items (orderId, productId, quantity, price)
      VALUES (?, ?, ?, ?)
    `);
    for (const item of items) {
      insertItem.run(orderId, item.productId, item.quantity, item.price);
    }
  });

  updateOrderAndItems();
  return getOrderById(orderId);
}

function deleteOrder(orderId) {
  const result = db.prepare(`DELETE FROM "Order" WHERE orderId = ?`).run(orderId);
  return result.changes > 0;
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrder,
  deleteOrder,
};
