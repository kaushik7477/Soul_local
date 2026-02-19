import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerName: String,
  userPhone: String,
  imageUrl: String,
  productSku: String,
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);
