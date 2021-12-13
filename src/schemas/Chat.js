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
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Chat', ChatSchema);
