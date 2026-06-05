/**
 * API Gateway
 * ------------
 * Single entry point for the e-commerce app.
 * Routes incoming HTTP requests to the correct microservice.
 * In production you might add auth, rate limiting, and logging here.
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs — set via env (Docker/Kubernetes) or defaults for local dev
const SERVICES = {
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  cart: process.env.CART_SERVICE_URL || 'http://localhost:3002',
  users: process.env.USER_SERVICE_URL || 'http://localhost:8081',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:8082',
};

app.use(cors());
app.use(express.json());

// Health check — Kubernetes uses this to know the pod is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// API overview for learners
app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API Gateway',
    routes: {
      products: 'GET /api/products',
      productById: 'GET /api/products/:id',
      cart: 'GET /api/cart/:userId | POST /api/cart',
      users: 'GET /api/users | GET /api/users/:id',
      orders: 'POST /api/orders | GET /api/orders/user/:userId',
    },
  });
});

/**
 * Proxy helper — forwards /api/... to each backend service.
 * pathRewrite strips /api prefix so backends see /products, /cart, etc.
 */
function proxy(target, pathRewrite) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(502).json({ error: 'Backend service unavailable', detail: err.message });
    },
  });
}

// Product Service routes
app.use('/api/products', proxy(SERVICES.products, { '^/api/products': '/products' }));

// Cart Service routes
app.use('/api/cart', proxy(SERVICES.cart, { '^/api/cart': '/cart' }));

// User Service routes
app.use('/api/users', proxy(SERVICES.users, { '^/api/users': '/users' }));

// Order Service routes
app.use('/api/orders', proxy(SERVICES.orders, { '^/api/orders': '/orders' }));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Routing to:', SERVICES);
});
