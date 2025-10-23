const express = require('express');
const { v4: uuidv4 } = require('uuid');
const products = require('../data/products');
const auth = require('../middleware/auth');

const router = express.Router();

// ✅ GET all products with filtering, search, pagination
router.get('/', (req, res) => {
  let result = products;

  // Filtering
  if (req.query.category) {
    result = result.filter(
      p => p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }

  // Search
  if (req.query.search) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(req.query.search.toLowerCase())
    );
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || result.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = result.slice(start, end);

  res.json({
    total: result.length,
    page,
    limit,
    data: paginated
  });
});

// ✅ GET product by ID
router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  res.json(product);
});

// ✅ POST create new product
router.post('/', auth, (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (!name || price == null) {
    const err = new Error('Validation Error: name and price are required');
    err.status = 400;
    return next(err);
  }

  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ✅ PUT update existing product
router.put('/:id', auth, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// ✅ DELETE product
router.delete('/:id', auth, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    const err = new Error('Product not found');
    err.status = 404;
    return next(err);
  }
  products.splice(index, 1);
  res.json({ message: 'Product deleted successfully' });
});

// ✅ Product stats
router.get('/stats/all', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json({ total: products.length, byCategory: stats });
});

module.exports = router;
