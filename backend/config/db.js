const sql = require('mssql');

const config = {
  server: '72.62.240.189',
  port: 1433,
  database: 'b2bPharmacyDB',
  user: 'sa',
  password: 'Gsquare@123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => console.error('❌ DB Connection Failed:', err));

module.exports = { sql, poolPromise };