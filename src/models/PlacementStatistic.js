const mongoose = require('mongoose');

const PlacementStatisticSchema = new mongoose.Schema({
  studentsPlaced: {
    value: {
      type: String,
      required: true
    },
    increase: {
      type: String,
      default: "0%"
    }
  },
  averagePackage: {
    value: {
      type: String,
      required: true
    },
    increase: {
      type: String,
      default: "0%"
    }
  },
  successRate: {
    value: {
      type: String,
      required: true
    },
    increase: {
      type: String,
      default: "0%"
    }
  },
  campusRecruiters: {
    value: {
      type: String,
      required: true
    },
    increase: {
      type: String,
      default: "0%"
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PlacementStatistic', PlacementStatisticSchema);
