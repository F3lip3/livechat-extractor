import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    group_id: {
      type: Number,
      required: true,
      unique: true
    },
    account_group_id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Group', GroupSchema);
