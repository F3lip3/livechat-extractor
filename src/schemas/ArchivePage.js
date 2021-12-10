import mongoose from 'mongoose';

const ArchivePageSchema = new mongoose.Schema(
  {
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

export default mongoose.model('ArchivePage', ArchivePageSchema);
