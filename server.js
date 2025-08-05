const express = require('express');
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
const upload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => cb(null, file.originalname)
  }),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10)
  }
});
const PORT = process.env.PORT || 3000;

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: true
});
const BUCKET = process.env.BUCKET_NAME;

app.get('/upload', (req, res) => {
  res.send(`
    <h1>Upload Video</h1>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="video" accept="video/*" />
      <button type="submit">Upload</button>
    </form>
    <p><a href="/videos">View Videos</a></p>
  `);
});

app.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  if (!req.file.mimetype.startsWith('video/')) {
    return res.status(400).send('Invalid file type');
  }
  try {
    const fileStream = fs.createReadStream(req.file.path);
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: req.file.originalname,
        Body: fileStream,
        ContentType: req.file.mimetype
      })
    );
    await fs.promises.unlink(req.file.path);
    res.redirect('/videos');
  } catch (err) {
    res.status(500).send('Upload failed');
  }
});

app.get('/videos', async (req, res) => {
  try {
    const list = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET })
    );
    const items = list.Contents || [];
    const videos = await Promise.all(
      items.map(async (item) => {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: BUCKET, Key: item.Key }),
          { expiresIn: 3600 }
        );
        return `<div><p>${item.Key}</p><video src="${url}" controls width="320"></video></div>`;
      })
    );
    res.send(`
      <h1>Uploaded Videos</h1>
      <p><a href="/upload">Upload more</a></p>
      ${videos.join('')}
    `);
  } catch (err) {
    res.status(500).send('Could not list videos');
  }
});

app.get('/', (req, res) => {
  res.redirect('/upload');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
