import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    message_id: {
      type: Number,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Message', MessageSchema);
