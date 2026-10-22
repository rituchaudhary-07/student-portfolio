import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
)

// Pre-save hook to automatically trim title whitespace (Supplementary requirement)
taskSchema.pre('save', function () {
  if (this.title) {
    this.title = this.title.trim()
  }
})

const Task = mongoose.model('Task', taskSchema)

export default Task
