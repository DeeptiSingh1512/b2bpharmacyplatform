const express = require('express');
const cors = require('cors');

require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const invoiceRoutes = require('./routes/invoices');
const returnsRoutes = require('./routes/returns');
const notificationsRoutes = require('./routes/notifications');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/test', (req, res) => {
  res.json({ message: 'test works' });
});

app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentsRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🚀 B2B Pharmacy API is running!' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
