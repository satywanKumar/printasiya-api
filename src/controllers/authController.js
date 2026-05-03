const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sk@112233';

// Generate JWT Token
const generateToken = (adminId) => {
  return jwt.sign(
    { id: adminId, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Login admin
exports.login = (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    const token = generateToken('admin');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: 'admin',
        role: 'admin'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify token
exports.verifyToken = (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      admin: req.admin
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
