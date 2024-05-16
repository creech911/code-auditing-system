require('dotenv').config();

const express = require('express');
const fileUploadMiddleware = require('express-fileupload');
const IPFS = require('ipfs-http-client');
const path = require('path');

const app = express();
const defaultPort = 3000;
const port = process.env.PORT || defaultPort;

const ipfsConnectionOptions = {
  host: process.env.IPFS_HOST,
  port: process.env.IPFS_PORT,
  protocol: process.env.IPFS_PROTOCOL,
};
const ipfsClient = new IPFS(ipfsConnectionOptions);

app.use(express.static('public'));
app.use(fileUploadMiddleware());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/uploadFile', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const { file: fileToUpload } = req.files;

  try {
    const addedFileResponse = await ipfsClient.add(fileToUpload.data);
    const ipfsHash = addedFileResponse.path;

    res.send({ 
      message: 'File uploaded successfully to IPFS',
      ipfsHash,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});