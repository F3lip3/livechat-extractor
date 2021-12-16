import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true
    },
    ticketId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Comment', CommentSchema);
