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

// Add indexes for performance
tableSchema.index({ tableNumber: 1 });
tableSchema.index({ status: 1 });

module.exports = mongoose.model('Table', tableSchema);