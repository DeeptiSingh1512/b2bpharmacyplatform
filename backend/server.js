const express = require('express');
const cors = require('cors');

// Import DB to test connection on startup
require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 B2B Pharmacy API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
