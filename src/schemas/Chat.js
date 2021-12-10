import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    chat_id: {
      type: String,
      required: true
    },
    thread_id: {
      type: String,
      required: true
    },
    conversation_id: {
      type: Number,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Chat', ChatSchema);
