import mongoose from "mongoose";

const statisticsSchema = new mongoose.Schema({
  // Common fields
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  
  // CTC Statistics
  ctcStatistics: {
    averageCTC: {
      type: Number,
      required: true
    },
    medianCTC: {
      type: Number,
      required: true
    }
  },
  
  // Placement Statistics
  placementStatistics: {
    department: {
      type: String,
      required: true,
      trim: true
    },
    percentagePlaced: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  
  // Higher Studies Statistics
  higherStudiesStatistics: {
    department: {
      type: String,
      required: true,
      trim: true
    },
    percentageHigherStudies: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
statisticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Statistics = mongoose.model("Statistics", statisticsSchema);