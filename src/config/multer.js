const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_S3_REGION||'india',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID||"wewe",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY||"dfdfdfds",
    },
  });

module.exports = {s3};