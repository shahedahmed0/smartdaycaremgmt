const mongoose = require('mongoose');
const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    child: { 
      type: Schema.Types.ObjectId, 
      ref: 'Child', 
      required: true 
    },
    month: { 
      type: Number, 
      required: true 
    },
    year: { 
      type: Number, 
      required: true 
    },
    daysPresent: { 
      type: Number, 
      default: 0 
    },
    baseRatePerDay: { 
      type: Number, 
      default: 0 
    },
    extraCharges: { 
      type: Number, 
      default: 0 
    },
    totalAmount: { 
      type: Number, 
      required: true 
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
    },
    generatedAt: { 
      type: Date, 
      default: Date.now 
    },
    paidAt: Date
  },
  { timestamps: true }
);

invoiceSchema.index({ child: 1, year: 1, month: 1 });
invoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
