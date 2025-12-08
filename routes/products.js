const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const { category, isRental, featured } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (isRental !== undefined) filter.isRental = isRental === 'true';
        if (featured !== undefined) filter.featured = featured === 'true';

        const products = await Product.find(filter)
            .populate('category', 'name')
            .select('-images.data')
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .select('-images.data');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get product image
router.get('/:id/image/:index', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        const imageIndex = parseInt(req.params.index);

        if (!product || !product.images || !product.images[imageIndex]) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const image = product.images[imageIndex];
        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (error) {
        console.error('Get product image error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create product (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, isRental, rentalPrice, stock, featured } = req.body;

        const productData = {
            name,
            description,
            price: parseFloat(price),
            category,
            isRental: isRental === 'true',
            stock: parseInt(stock) || 1,
            featured: featured === 'true'
        };

        if (productData.isRental && rentalPrice) {
            productData.rentalPrice = parseFloat(rentalPrice);
        }

        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        const product = new Product(productData);
        await product.save();

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name')
            .select('-images.data');

        res.status(201).json(populatedProduct);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product (admin only)
router.put('/:id', authMiddleware, adminMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, isRental, rentalPrice, stock, featured, keepExistingImages } = req.body;

        const updateData = {
            name,
            description,
            price: parseFloat(price),
            category,
            isRental: isRental === 'true',
            stock: parseInt(stock) || 1,
            featured: featured === 'true',
            updatedAt: Date.now()
        };

        if (updateData.isRental && rentalPrice) {
            updateData.rentalPrice = parseFloat(rentalPrice);
        }

        // Handle images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));

            if (keepExistingImages === 'true') {
                const existingProduct = await Product.findById(req.params.id);
                updateData.images = [...existingProduct.images, ...newImages];
            } else {
                updateData.images = newImages;
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name').select('-images.data');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
