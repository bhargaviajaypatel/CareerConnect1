import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['video', 'article'] },
  url: { type: String, required: true },
  description: { type: String },
});

const SkillRoadmapSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  resources: [ResourceSchema],
});

const RoadmapSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  jobProfile: { type: String, required: true },
  skills: [SkillRoadmapSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserProgressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roadmapId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Roadmap', 
    required: true 
  },
  completedResources: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap.skills.resources'
  }],
  lastUpdated: { type: Date, default: Date.now },
});

const RoadmapModel = mongoose.model("Roadmap", RoadmapSchema);
const UserProgressModel = mongoose.model("UserProgress", UserProgressSchema);

export { RoadmapModel as Roadmap, UserProgressModel as UserProgress };