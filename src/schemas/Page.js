import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema(
  {
    object: {
      type: String,
      required: true
    },
    next_page_id: {
      type: String
    },
    next_page: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Page', PageSchema);
