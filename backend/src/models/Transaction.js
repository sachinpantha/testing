const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receptionist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalAmount: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);