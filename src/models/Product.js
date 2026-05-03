const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters']
    },
    image: {
      type: String,
      required: [true, 'Product image is required']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters']
    },
    totalStock: {
      type: Number,
      required: [true, 'Total stock is required'],
      min: [0, 'Total stock cannot be negative']
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, 'Sold quantity cannot be negative']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for available stock
productSchema.virtual('availableStock').get(function() {
  return this.totalStock - this.sold;
});

module.exports = mongoose.model('Product', productSchema);
