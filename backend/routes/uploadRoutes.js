const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const { protectRoute } = require('../middleware/authMiddleware');

// Upload route (allows multiple files)
router.post('/', protectRoute, upload.array('photos', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Return the public URLs (e.g. /uploads/filename.jpg)
    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      urls: fileUrls
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

module.exports = router;
