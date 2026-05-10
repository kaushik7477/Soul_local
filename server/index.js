import 'dotenv/config'; // Load env vars before other imports
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import Tag from './models/Tag.js';
import Product from './models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection
io.on('connection', (socket) => {
  if (process.env.SOCKET_LOGS === 'true') console.log('User connected:', socket.id);
  socket.on('disconnect', () => {
    if (process.env.SOCKET_LOGS === 'true') console.log('User disconnected:', socket.id);
  });
});

// Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database Connection State
let dbConnectionError = null;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/soulstich';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    dbConnectionError = null;
    
    // Initialize default tags if empty
    Tag.countDocuments()
      .then(count => {
        if (count === 0) {
          Tag.insertMany([
            { name: 'Puff Print' }, 
            { name: 'DTF' }, 
            { name: 'Screen Print' }, 
            { name: 'Hybrid' },
            { name: 'Oversized' },
            { name: 'Men' },
            { name: 'Women' }
          ])
          .then(() => console.log('Default tags inserted'))
          .catch(err => console.error('Error inserting default tags:', err));
        }
      })
      .catch(err => console.error('Error checking tags count:', err));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    dbConnectionError = err.message;
  });

  // Health Check / Status Middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // 1 = connected
    if (req.path.startsWith('/api')) {
       return res.status(503).json({ 
         error: 'Service Unavailable', 
         message: 'Database connection failed. Please check server logs.',
         details: dbConnectionError || 'Connecting...'
       });
    }
  }
  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Dynamic Sitemap Route
app.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find({}).select('_id updatedAt');
    const tags = await Tag.find({}).select('name');
    
    const baseUrl = 'https://thesoulstich.com';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    // Add Category pages
    tags.forEach(tag => {
      xml += `
  <url>
    <loc>${baseUrl}/products?cat=${encodeURIComponent(tag.name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add Product pages
    products.forEach(product => {
      xml += `
  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <lastmod>${product.updatedAt ? product.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += '\n</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

const distPath = path.join(__dirname, '..', 'dist');
console.log(distPath);

app.use(express.static(distPath));

// Serve index.html for all other routes
app.get('/', (_, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
