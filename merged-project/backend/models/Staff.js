const mongoose = require('mongoose');
const { Schema } = mongoose;

const staffSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['caregiver', 'teacher', 'cook'], 
      required: true 
    },
    childrenAssignedCount: { 
      type: Number, 
      default: 0 
    },
    weeklyHours: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
