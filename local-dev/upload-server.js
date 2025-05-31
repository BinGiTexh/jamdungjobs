const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Create a simple Express app for file uploads
const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());

// Configure file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple file upload endpoint
app.post('/upload', upload.single('resume'), (req, res) => {
  console.log('File upload endpoint called');
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    console.log('File uploaded successfully:', req.file.filename);
    
    return res.json({
      success: true,
      message: 'File uploaded successfully',
      resumeUrl: fileUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`File upload server running on port ${PORT}`);
});
