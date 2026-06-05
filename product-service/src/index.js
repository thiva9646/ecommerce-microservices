/**
 * Product Service
 * ----------------
 * Stores product catalog in MongoDB.
 * REST: GET /products, GET /products/:id
 */

const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'ecommerce';
const COLLECTION = 'products';

// Dummy products — food theme inspired by learning examples (meal kit / grocery style)
const SEED_PRODUCTS = [
  { name: 'Weekly Meal Kit - Classic', description: '5 dinners for two', price: 79.99, category: 'meal-kit', image: '/images/meal-kit-classic.jpg' },
  { name: 'Weekly Meal Kit - Vegetarian', description: 'Plant-based dinners', price: 74.99, category: 'meal-kit', image: '/images/meal-kit-veg.jpg' },
  { name: 'Organic Salad Bowl', description: 'Ready-to-eat greens', price: 12.5, category: 'ready-meal', image: '/images/salad.jpg' },
  { name: 'Grilled Chicken Plate', description: 'High protein lunch', price: 14.99, category: 'ready-meal', image: '/images/chicken.jpg' },
  { name: 'Smoothie Starter Pack', description: 'Breakfast bundle', price: 24.0, category: 'bundle', image: '/images/smoothie.jpg' },
  { name: 'Family Pasta Night', description: 'Serves 4', price: 32.0, category: 'meal-kit', image: '/images/pasta.jpg' },
];

app.use(cors());
app.use(express.json());

let db;
let productsCollection;

async function connectMongo() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  productsCollection = db.collection(COLLECTION);
  console.log('Connected to MongoDB');

  // Seed if collection is empty (learning/demo data)
  const count = await productsCollection.countDocuments();
  if (count === 0) {
    const result = await productsCollection.insertMany(SEED_PRODUCTS);
    console.log(`Seeded ${result.insertedCount} products`);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

// List all products
app.get('/products', async (req, res) => {
  try {
    const products = await productsCollection.find({}).toArray();
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single product by MongoDB ObjectId string
app.get('/products/:id', async (req, res) => {
  try {
    const { ObjectId } = require('mongodb');
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid product id' });
    }
    const product = await productsCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

connectMongo()
  .then(() => {
    app.listen(PORT, () => console.log(`Product Service on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
