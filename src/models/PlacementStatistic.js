import mongoose from 'mongoose';

const PlacementStatisticSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  totalStudents: {
    type: Number,
    required: true,
    min: 0
  },
  placedStudents: {
    type: Number,
    required: true,
    min: 0
  },
  averagePackage: {
    type: Number,
    required: true,
    min: 0
  },
  highestPackage: {
    type: Number,
    min: 0
  },
  companiesVisited: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PlacementStatisticSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PlacementStatistic', PlacementStatisticSchema);
