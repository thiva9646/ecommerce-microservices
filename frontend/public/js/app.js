/**
 * FED Store Frontend
 * Calls microservices through nginx proxy: /api/* -> api-gateway
 */

const API = '/api';
const USER_ID = '1'; // Demo user (seeded in MySQL)

let cart = [];

// Category emoji for product cards (no real images in demo)
const CATEGORY_ICONS = {
  'meal-kit': '🥗',
  'ready-meal': '🍽️',
  bundle: '📦',
};

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const preview = document.getElementById('heroPreview');

  try {
    const res = await fetch(`${API}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !json.data?.length) {
      grid.innerHTML = '<p class="error">No products found.</p>';
      return;
    }

    // Hero preview — first 2 product names
    preview.textContent = json.data
      .slice(0, 2)
      .map((p) => p.name)
      .join(' · ');

    grid.innerHTML = json.data.map((p) => renderProductCard(p)).join('');

    document.querySelectorAll('.add-btn').forEach((btn) => {
      btn.addEventListener('click', () => addToCart(JSON.parse(btn.dataset.product)));
    });
  } catch (err) {
    grid.innerHTML = `<p class="error">Could not load products. Is the API running?<br>${err.message}</p>`;
    preview.textContent = 'API unavailable';
  }
}

function renderProductCard(product) {
  const icon = CATEGORY_ICONS[product.category] || '✨';
  const data = JSON.stringify(product).replace(/"/g, '&quot;');

  return `
    <article class="product-card">
      <div class="product-image">${icon}</div>
      <div class="product-body">
        <span class="product-category">${product.category || 'item'}</span>
        <h3>${product.name}</h3>
        <p>${product.description || ''}</p>
        <div class="product-footer">
          <span class="price">$${Number(product.price).toFixed(2)}</span>
          <button class="add-btn" data-product="${data}">ADD TO CART</button>
        </div>
      </div>
    </article>
  `;
}

async function addToCart(product) {
  try {
    const res = await fetch(`${API}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: USER_ID,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
      }),
    });
    const json = await res.json();
    if (json.success) {
      cart = json.data.items || [];
      renderCart();
    }
  } catch (err) {
    alert('Failed to add to cart: ' + err.message);
  }
}

async function loadCart() {
  try {
    const res = await fetch(`${API}/cart/${USER_ID}`);
    const json = await res.json();
    if (json.success) {
      cart = json.data.items || [];
      renderCart();
    }
  } catch {
    // Cart service may be empty on first load
  }
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  const totalEl = document.getElementById('cartTotal');

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);

  countEl.textContent = count;
  totalEl.textContent = total.toFixed(2);

  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty. Add something delicious!</p>';
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <span>${item.name} × ${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `
    )
    .join('');
}

async function placeOrder() {
  const msg = document.getElementById('orderMessage');
  msg.textContent = '';
  msg.className = 'order-message';

  if (!cart.length) {
    msg.textContent = 'Add items to your cart first.';
    msg.className = 'order-message error';
    return;
  }

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: Number(USER_ID),
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      }),
    });
    const json = await res.json();

    if (json.success) {
      msg.textContent = `Order #${json.data.id} placed! Total: $${json.data.total}`;
      msg.className = 'order-message success';
      cart = [];
      renderCart();
    } else {
      throw new Error(json.error || 'Order failed');
    }
  } catch (err) {
    msg.textContent = 'Order failed: ' + err.message;
    msg.className = 'order-message error';
  }
}

document.getElementById('checkoutBtn').addEventListener('click', placeOrder);
document.getElementById('cartBtn').addEventListener('click', () => {
  document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' });
});

loadProducts();
loadCart();
