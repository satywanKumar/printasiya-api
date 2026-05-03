const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search } = req.query;
    
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, totalStock } = req.body;

    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Validate required fields
    if (!name || !description || !totalStock) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and total stock are required'
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Product image is required'
      });
    }

    console.log('File details:', req.file);
    const imageUrl = req.file.path || req.file.secure_url;

    const product = new Product({
      name,
      description,
      totalStock: parseInt(totalStock),
      image: imageUrl,
      sold: 0
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error stack:', error.stack);
    
    // Delete uploaded image from cloudinary if product creation fails
    if (req.file) {
      try {
        const publicId = req.file.filename;
        await cloudinary.uploader.destroy(`printasiya/products/${publicId}`);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product'
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, totalStock } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (totalStock) product.totalStock = parseInt(totalStock);

    // Handle image update
    if (req.file) {
      // Delete old image
      try {
        const oldImageUrl = product.image;
        const publicId = oldImageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`printasiya/products/${publicId}`);
      } catch (err) {
        console.error('Error deleting old image:', err);
      }

      product.image = req.file.path;
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image from cloudinary
    try {
      const imageUrl = product.image;
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`printasiya/products/${publicId}`);
    } catch (err) {
      console.error('Error deleting image:', err);
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add stock
exports.addStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.totalStock += parseInt(quantity);
    await product.save();

    res.json({
      success: true,
      message: 'Stock added successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Sell product
exports.sellProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const availableStock = product.totalStock - product.sold;

    if (quantity > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} units available`
      });
    }

    product.sold += parseInt(quantity);
    await product.save();

    res.json({
      success: true,
      message: 'Product sold successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
