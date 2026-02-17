const multer = require("multer");
const multerS3 = require("multer-s3");
const {s3} = require("../config/multer");

// Get bucket name with fallback
const bucketName = process.env.AWS_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || '';

if (!bucketName) {
  console.error('⚠️  WARNING: AWS_BUCKET_NAME or AWS_S3_BUCKET_NAME is not set in environment variables');
}

const multiUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName || 'default-bucket-name', // Provide a default or throw error
    acl: "public-read", // ⚠ change to private in production
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `uploads/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  },
});

module.exports = multiUpload;