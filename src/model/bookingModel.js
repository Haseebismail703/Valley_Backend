import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookingSchema = new Schema(
  {
    route: { type: String, required: true },

    dateType: {
      type: String,
      enum: ["single", "multiple", "recurring"],
      required: true,
    },

    dates: {
      type: [Date], 
      required: true,
    },

    recurringInfo: {
      day: { type: String }, 
      weeks: { type: Number },
    },

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    email: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one email is required",
      },
    },

    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    passengers: { type: Number, required: true },

    mobileOnPickupDay: { type: String, default: null },
    notes: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const Booking = model("Booking", bookingSchema);

export default Booking;
