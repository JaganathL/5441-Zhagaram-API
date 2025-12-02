const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all categories (public)
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().select('-image.data');
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get category by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).select('-image.data');
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get category image
router.get('/:id/image', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || !category.image || !category.image.data) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.set('Content-Type', category.image.contentType);
        res.send(category.image.data);
    } catch (error) {
        console.error('Get category image error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create category (admin only)
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;

        const categoryData = {
            name,
            description
        };

        if (req.file) {
            categoryData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const category = new Category(categoryData);
        await category.save();

        const categoryResponse = category.toObject();
        delete categoryResponse.image;

        res.status(201).json(categoryResponse);
    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update category (admin only)
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { name, description } = req.body;

        const updateData = {
            name,
            description,
            updatedAt: Date.now()
        };

        if (req.file) {
            updateData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-image.data');

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Update category error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category name already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
