const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['vacant', 'occupied', 'served', 'billed'], 
    default: 'vacant' 
  },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);