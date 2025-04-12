import Booking from "../model/bookingModel.js";
import sendMailToAdmin from "../utils/sendMail.js";
import Payment from "../model/paymentModel.js";

// Create a new booking
const bookingSlot = async (req, res) => {
  try {
    const {
      route ,
      dateType,
      dates,
      time,
      recurringInfo,
      firstName,
      lastName,
      phoneNumber,
      email,
      pickupLocation,
      dropoffLocation,
      passengers,
      mobileOnPickupDay,
      notes
    } = req.body;

    // Validate required fields
    if ( !route || !dateType || !dates || !time || !firstName || !lastName || !phoneNumber ||
      !email || !pickupLocation || !dropoffLocation || !passengers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dateType specific rules
    if (dateType === 'single' && dates.length !== 1) {
      return res.status(400).json({
        error: 'Single date type requires exactly one date'
      });
    }

    if (dateType === 'recurring' && !recurringInfo) {
      return res.status(400).json({
        error: 'Recurring bookings require recurringInfo'
      });
    }

    // Validate email is an array with at least one email
    if (!Array.isArray(email) || email.length === 0) {
      return res.status(400).json({
        error: 'At least one email is required'
      });
    }

    // Create new booking
    const newBooking = new Booking({
      route,
      dateType,
      dates,
      time,
      recurringInfo,
      firstName,
      lastName,
      phoneNumber,
      email,
      pickupLocation,
      dropoffLocation,
      passengers,
      mobileOnPickupDay: mobileOnPickupDay || null,
      notes: notes || null
    });

    const savedBooking = await newBooking.save();
    await sendMailToAdmin(savedBooking)
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: savedBooking
    });

  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate booking detected'
      });
    }

    // General server error
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
};


let availableSlots = async (req, res) => {
  const ALL_TIME_SLOTS = ["6:00 AM", "12:00 PM", "6:00 PM"]; 

  try {
    const { date } = req.body; // Only date is provided in the request body
    // console.log(req.body)
    if (!date) return res.status(400).json({ message: "Date is required." });

    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(); // Get the day name (e.g., 'monday')

    // Find bookings that match the provided date, regardless of dateType (single, multiple, or recurring)
    const bookings = await Booking.find({
      $or: [
        // Handle single and multiple date bookings
        {
          dateType: { $in: ["single", "multiple"] },
          dates: { $in: [targetDate] }
        },
        // Handle recurring bookings
        {
          dateType: "recurring",
          $or: [
            { "recurringInfo.repeatType": "daily" }, // Every day
            { "recurringInfo.repeatType": `every-${dayName}`, "recurringInfo.timeToRepeat": 1 }, // Every week on the specified day
            {
              "recurringInfo.repeatType": "every_other_thursday",
              "recurringInfo.timeToRepeat": 2, // Every other Thursday (check with timeToRepeat)
              "dates": { $in: [targetDate] }
            },
            {
              "recurringInfo.repeatType": "every-third-thursday",
              "recurringInfo.timeToRepeat": 3, // Every third Thursday
              "dates": { $in: [targetDate] }
            },
            {
              "recurringInfo.repeatType": "every-fourth-thursday",
              "recurringInfo.timeToRepeat": 4, // Every fourth Thursday
              "dates": { $in: [targetDate] }
            },
          ]
        }
      ]
    });

    // Extract booked slots (dates and times)
    const bookedSlots = bookings.flatMap((b) => b.time);

    // Get available slots by filtering out the booked slots
    const availableSlots = ALL_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    res.json({ date, availableSlots });

  } catch (error) {
    console.error("Error checking available slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};

let savePaymentDetails = async (req, res) => {
  try {
    const { cardNumber, cvv, expiryDate, amount } = req.body;

    if (!cardNumber || !cvv || !expiryDate || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const payment = new Payment({ cardNumber, cvv, expiryDate, amount });
    await payment.save();

    res.status(200).json({ message: "Payment saved successfully." });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong.", error });
  }
};
export { bookingSlot, availableSlots, savePaymentDetails }