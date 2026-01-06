const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema(
  {
    child: { 
      type: Schema.Types.ObjectId, 
      ref: 'Child', 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    checkInTime: Date,
    checkOutTime: Date,
    extraServiceCharge: { 
      type: Number, 
      default: 0 
    },
    meals: [{ 
      type: String 
    }]
  },
  { timestamps: true }
);

attendanceSchema.index({ child: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
