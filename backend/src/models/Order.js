const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'ready', 'served'], 
    default: 'pending' 
  }
});

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  waiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: { 
    type: String, 
    enum: ['pending', 'in_kitchen', 'ready', 'served', 'billed'], 
    default: 'pending' 
  },
  totalAmount: { type: Number, default: 0 }
}, { timestamps: true });

// Add indexes for performance
orderSchema.index({ tableNumber: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ waiter: 1 });

module.exports = mongoose.model('Order', orderSchema);