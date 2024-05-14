require('dotenv').config();

const express = require('express');
const fileUpload = require('express-fileupload');
const IPFS = require('ipfs-http-client');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const ipfsClientOptions = {
  host: process.env.IPFS_HOST,
  port: process.env.IPFS_PORT,
  protocol: process.env.IPFS_PROTOCOL,
};
const ipfs = new IPFS(ipfsClientOptions);

app.use(express.static('public'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const { file: uploadedFile } = req.files;

  try {
    const fileAdded = await ipfs.add(uploadedFile.data);
    const { path: ipfsHash } = fileAdded;

    res.send({ 
      message: 'File uploaded successfully',
      ipfsHash,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});