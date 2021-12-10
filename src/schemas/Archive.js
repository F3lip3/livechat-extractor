import mongoose from 'mongoose';

const ArchiveSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
      required: true
    },
    thread_id: {
      type: String,
      required: true
    },
    hc_id: {
      type: Number,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Archive', ArchiveSchema);
