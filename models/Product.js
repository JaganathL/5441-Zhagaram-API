const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    isRental: {
        type: Boolean,
        default: false
    },
    rentalPrice: {
        type: Number,
        min: 0
    },
    images: [{
        data: Buffer,
        contentType: String
    }],
    stock: {
        type: Number,
        default: 1,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

productSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Product', productSchema);
