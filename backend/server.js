const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const multer = require('multer'); // For handling file uploads
const path = require('path');
const connectDB = require('./config/db');
const tweetSchema = require('./graphql/schema');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// File storage configuration using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the folder where files will be stored
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`); // Unique filename with timestamp
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Set file size limit to 50MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|webm/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type! Only images and videos are allowed.'));
    }
  }
});

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload route for handling media uploads
app.post('/upload', upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return file path or URL
  res.json({
    message: 'File uploaded successfully',
    filePath: `/uploads/${req.file.filename}` // Return the accessible path for frontend
  });
});

// GraphQL route
app.use('/graphql', graphqlHTTP({
  schema: tweetSchema,
  graphiql: true, // Enable GraphiQL for testing
}));

// Auth routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
