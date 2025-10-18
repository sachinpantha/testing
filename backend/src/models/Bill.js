const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  tableNumber: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  receptionist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });

// Add indexes for performance
billSchema.index({ tableNumber: 1 });
billSchema.index({ createdAt: -1 });
billSchema.index({ isPaid: 1 });

module.exports = mongoose.model('Bill', billSchema);