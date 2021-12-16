import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    short_id: {
      type: String,
      required: true,
      unique: true
    },
    ticket_id: {
      type: Number,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Ticket', TicketSchema);
