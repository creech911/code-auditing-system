require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const IPFS = require('ipfs-http-client');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const ipfs = new IPFS({
  host: process.env.IPFS_HOST,
  port: process.env.IPFS_PORT,
  protocol: process.env.IPFS_PROTOCOL,
});

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  let uploadedFile = req.files.file;

  const fileContent = Buffer.from(uploadedFile.data);
  try {
    const fileAdded = await ipfs.add(fileContent);
    const ipfsHash = fileAdded.path;

    res.send({ 
      message: 'File uploaded successfully',
      ipfsHash: ipfsHash
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});