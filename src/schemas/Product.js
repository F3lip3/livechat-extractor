import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    product_id: {
      type: Number,
      required: true,
      unique: true
    },
    account_product_id: {
      type: Number,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Product', ProductSchema);
