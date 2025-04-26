// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Fixed casing of Product.js

// Get all products for homepage
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Add a product
router.post('/', async (req, res) => {
  try {
    const { name, image, description, price } = req.body;
    const product = new Product({ name, image, description, price });
    await product.save();
    res.status(201).json({ message: 'Product added', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product (admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description, price } = req.body;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Update all fields as per the product schema
    product.name = name;
    product.image = image;
    product.description = description;
    product.price = price;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin: Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
