/**
 * API Gateway — forwards /api/* to microservices
 */

const express = require('express');
const cors = require('cors');

const GATEWAY_VERSION = '2.0';
const app = express();
const PORT = process.env.PORT || 3000;

const SERVICES = {
  products: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
  cart: process.env.CART_SERVICE_URL || 'http://localhost:3002',
  users: process.env.USER_SERVICE_URL || 'http://localhost:8081',
  orders: process.env.ORDER_SERVICE_URL || 'http://localhost:8082',
};

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', version: GATEWAY_VERSION });
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: GATEWAY_VERSION,
    message: 'E-commerce API Gateway is running',
    tryThese: [
      'GET /api/products',
      'GET /api/users',
      'GET /health',
    ],
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
 * Build backend URL from full request path (no Express mount quirks).
 * /api/products     -> http://product-service:3001/products
 * /api/products/xyz -> http://product-service:3001/products/xyz
 */
function proxyMiddleware(serviceBase, apiPrefix, servicePrefix) {
  return async (req, res, next) => {
    if (!req.path.startsWith(apiPrefix)) {
      return next();
    }

    const rest = req.path.slice(apiPrefix.length);
    const queryIndex = req.originalUrl.indexOf('?');
    const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : '';
    const target = `${serviceBase}${servicePrefix}${rest}${query}`;

    const headers = { Accept: 'application/json' };
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }

    const options = { method: req.method, headers };

    if (!['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
      options.body = JSON.stringify(req.body);
    }

    try {
      const response = await fetch(target, options);
      const contentType = response.headers.get('content-type') || 'application/json';
      const body = await response.text();
      res.status(response.status).type(contentType).send(body);
    } catch (err) {
      console.error(`Proxy error [${target}]:`, err.message);
      res.status(502).json({
        error: 'Backend service unavailable',
        detail: err.message,
        target,
      });
    }
  };
}

app.use(proxyMiddleware(SERVICES.products, '/api/products', '/products'));
app.use(proxyMiddleware(SERVICES.cart, '/api/cart', '/cart'));
app.use(proxyMiddleware(SERVICES.users, '/api/users', '/users'));
app.use(proxyMiddleware(SERVICES.orders, '/api/orders', '/orders'));

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    hint: 'Try GET /api/products or GET /api/users',
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway v${GATEWAY_VERSION} on port ${PORT}`);
  console.log('Routing to:', SERVICES);
});
