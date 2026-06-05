/**
 * Cart Service
 * ------------
 * Manages shopping carts per user.
 * Uses in-memory storage for simplicity (learning project).
 * In production you'd use Redis or a database.
 *
 * REST:
 *   GET  /cart/:userId     — get user's cart
 *   POST /cart             — add item { userId, productId, name, price, quantity }
 *   DELETE /cart/:userId   — clear cart
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// In-memory store: userId -> { items: [], updatedAt }
const carts = new Map();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

function getOrCreateCart(userId) {
  if (!carts.has(userId)) {
    carts.set(userId, { userId, items: [], updatedAt: new Date().toISOString() });
  }
  return carts.get(userId);
}

// Get cart for a user
app.get('/cart/:userId', (req, res) => {
  const cart = getOrCreateCart(req.params.userId);
  res.json({ success: true, data: cart });
});

// Add item to cart (or increase quantity if product already in cart)
app.post('/cart', (req, res) => {
  const { userId, productId, name, price, quantity = 1 } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({
      success: false,
      error: 'userId and productId are required',
    });
  }

  const cart = getOrCreateCart(String(userId));
  const existing = cart.items.find((i) => i.productId === productId);

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      productId,
      name: name || 'Product',
      price: Number(price) || 0,
      quantity: Number(quantity),
    });
  }

  cart.updatedAt = new Date().toISOString();

  // Calculate simple total for learning
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  res.status(201).json({ success: true, message: 'Item added to cart', data: cart });
});

// Clear cart
app.delete('/cart/:userId', (req, res) => {
  carts.delete(req.params.userId);
  res.json({ success: true, message: 'Cart cleared' });
});

app.listen(PORT, () => {
  console.log(`Cart Service on port ${PORT}`);
  console.log('Note: cart data is in-memory and resets when the pod restarts.');
});
