/**
 * Lightweight schema validation middleware.
 * Usage: router.post('/products', authMiddleware, validate(productSchema), controller)
 */

const productSchema = {
  productName: { type: 'string', required: true, maxLength: 255 },
  price: { type: 'number', required: true, min: 0 },
  stock: { type: 'number', min: 0 },
  category: { type: 'string', maxLength: 100 },
  hsnCode: { type: 'string', maxLength: 20 },
  expiryDate: { type: 'date' },
};

const importSchema = {
  products: { type: 'array', required: true },
};

function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }

      if (rules.type === 'number' && isNaN(Number(value))) {
        errors.push(`${field} must be a number`);
      }

      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      if (rules.maxLength && String(value).length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }

      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }

      if (rules.type === 'date' && value && isNaN(Date.parse(value))) {
        errors.push(`${field} must be a valid date`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    next();
  };
}

module.exports = { validate, productSchema, importSchema };
