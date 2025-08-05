# Video Uploader

This application uses [Express](https://expressjs.com/) and Tigris object storage to upload and display video files.

## Setup

Set the following environment variables with your Tigris credentials:

```bash
export AWS_ACCESS_KEY_ID=... \
       AWS_SECRET_ACCESS_KEY=... \
       AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev \
       AWS_REGION=auto \
       BUCKET_NAME=your-bucket
```

Install dependencies and start the server:

```bash
npm install
npm start
```

Visit <http://localhost:3000/upload> to upload a video and <http://localhost:3000/videos> to view uploaded videos.
