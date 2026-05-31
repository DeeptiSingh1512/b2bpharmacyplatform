const PDFDocument = require('pdfkit');
const { poolPromise, sql } = require('../config/db');

exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const pool = await poolPromise;

    // Get order
    const orderResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query('SELECT id, userId, totalPrice, status, orderDate, createdAt FROM Orders WHERE id = @orderId');

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const order = orderResult.recordset[0];

    // Get order items
    const itemResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`SELECT oi.quantity, oi.unit_price, p.productName, p.hsnCode
              FROM OrderItems oi
              JOIN Products p ON oi.product_id = p.id
              WHERE oi.order_id = @orderId`);

    // Get retailer
    const userResult = await pool.request()
      .input('userId', sql.Int, order.userId)
      .query('SELECT fullName, phone FROM Users WHERE id = @userId');

    const retailer = userResult.recordset[0] || {};
    const items = itemResult.recordset;
    const invoiceDate = order.orderDate ? new Date(order.orderDate) : new Date(order.createdAt);
    const invoiceNumber = `INV-${order.id}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.id}.pdf`);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice Number: ${invoiceNumber}`);
    doc.text(`Invoice Date: ${invoiceDate.toISOString().split('T')[0]}`);
    doc.text(`Order Status: ${order.status}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Retailer Details', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').text(`Name: ${retailer.fullName || 'N/A'}`);
    doc.text(`Phone: ${retailer.phone || 'N/A'}`);
    doc.moveDown();

    const tableTop = doc.y;

    doc.font('Helvetica-Bold');
    doc.text('Product', 40, tableTop, { width: 150 });
    doc.text('HSN', 190, tableTop, { width: 80, align: 'right' });
    doc.text('Qty', 270, tableTop, { width: 60, align: 'right' });
    doc.text('Price', 340, tableTop, { width: 70, align: 'right' });
    doc.text('GST%', 415, tableTop, { width: 60, align: 'right' });
    doc.text('GST Amt', 480, tableTop, { width: 70, align: 'right' });
    doc.text('Total', 550, tableTop, { width: 70, align: 'right' });

    doc.moveDown(0.5);
    doc.font('Helvetica');

    let rowY = doc.y;
    let subtotal = 0;
    let totalGst = 0;

    for (const item of items) {
      const qty = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const gstPercent = 12;
      const itemTotal = qty * unitPrice;
      const gstAmount = Number(((itemTotal * gstPercent) / 100).toFixed(2));
      const lineTotal = itemTotal + gstAmount;

      subtotal += itemTotal;
      totalGst += gstAmount;

      doc.text(item.productName || 'N/A', 40, rowY, { width: 150 });
      doc.text(item.hsnCode || '-', 190, rowY, { width: 80, align: 'right' });
      doc.text(qty.toString(), 270, rowY, { width: 60, align: 'right' });
      doc.text(unitPrice.toFixed(2), 340, rowY, { width: 70, align: 'right' });
      doc.text(gstPercent.toFixed(2), 415, rowY, { width: 60, align: 'right' });
      doc.text(gstAmount.toFixed(2), 480, rowY, { width: 70, align: 'right' });
      doc.text(lineTotal.toFixed(2), 550, rowY, { width: 70, align: 'right' });
      rowY += 20;

      if (rowY > 730) {
        doc.addPage();
        rowY = 40;
      }
    }

    const grandTotal = subtotal + totalGst;

    doc.moveTo(40, rowY + 10).lineTo(560, rowY + 10).stroke();
    doc.font('Helvetica-Bold');
    doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 400, rowY + 20, { align: 'right' });
    doc.text(`Total GST: ${totalGst.toFixed(2)}`, 400, rowY + 40, { align: 'right' });
    doc.text(`Grand Total: ${grandTotal.toFixed(2)}`, 400, rowY + 60, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Invoice generation error:', error);
    return res.status(500).json({ message: 'Failed to generate invoice.' });
  }
};