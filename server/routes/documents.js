const express = require('express');
const multer = require('multer');
const minio = require('../services/minio');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { type = 'misc', id = Date.now() } = req.body;
    const ext = req.file.originalname.split('.').pop();
    const objectName = `${type}/${id}/${req.file.originalname}`;

    await minio.uploadFile(objectName, req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      url: `/api/documents/${objectName}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple documents
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { type = 'misc', id = Date.now() } = req.body;
    const results = [];

    for (const file of req.files) {
      const objectName = `${type}/${id}/${file.originalname}`;
      await minio.uploadFile(objectName, file.buffer, file.mimetype);
      results.push({
        url: `/api/documents/${objectName}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    res.json({ success: true, files: results });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get document - handles paths like /templates/123/document.pdf
router.get('/*', async (req, res) => {
  try {
    // Get the full path from the URL
    const objectName = req.params[0];

    if (!objectName) {
      return res.status(400).json({ error: 'Object name required' });
    }

    // Check if file exists
    const exists = await minio.fileExists(objectName);
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get file stats for content type
    const stat = await minio.getFileStat(objectName);

    // Set content type header
    res.setHeader('Content-Type', stat.metaData?.['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);

    // Get filename from path for content disposition
    const filename = objectName.split('/').pop();
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream file to response
    const stream = await minio.getFile(objectName);
    stream.pipe(res);
  } catch (error) {
    console.error('Error getting document:', error);
    if (error.code === 'NotFound') {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete document
router.delete('/*', async (req, res) => {
  try {
    const objectName = req.params[0];

    if (!objectName) {
      return res.status(400).json({ error: 'Object name required' });
    }

    await minio.deleteFile(objectName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
