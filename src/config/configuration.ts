export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '24h',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAZ2222222222222222',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '2222222222222222222222222222222222222222',
    region: process.env.AWS_REGION || 'ap-northeast-2',
    bucketName: process.env.AWS_S3_BUCKET_NAME || 'growsome',
  },
}); 