import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true
    },
    next_page_id: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Page', PageSchema);
