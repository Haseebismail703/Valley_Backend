import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookingSchema = new Schema(
  {
    dateType: {
      type: String,
      enum: ["single", "multiple", "recurring"],
      required: true,
    },

    dates: [{ type: Date, required: true }],
    time: [{ type: String, required: true }],

    // Advanced Recurring Info
    recurringInfo: {
      repeatType: {
        type: String,
        enum: [
          "daily",
          "every_thursday",
          "every_other_thursday",
          "every_third_thursday",
          "every_fourth_thursday",
          "first_of_month",
          "first_thursday_of_month"
        ],
      },
      timeToRepeat: {
        type: Number, // Repeat time interval: 1 to 24
        min: 1,
        max: 24,
      },
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
  { timestamps: true }
);

const Booking = model("Booking", bookingSchema);
export default Booking;
