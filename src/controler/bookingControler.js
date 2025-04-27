import Booking from "../model/bookingModel.js";
import sendMailToAdmin from "../utils/sendMail.js";
// Create a new booking
const bookingSlot = async (req, res) => {
  try {
    const {
      type,
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
      mobileOnPickupDay,
      notes
    } = req.body;
    if (
     !type || !route || !dateType || !dates || !time || !firstName || !lastName || !phoneNumber ||
      !email || !pickupLocation || !dropoffLocation || !passengers  || !mobileOnPickupDay 
    ) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    if (!Array.isArray(email) || email.length === 0 || email == "") {
      return res.status(400).json({
        error: 'At least one email is required'
      });
    }

    // ✅ Check if slot is already booked
    const existingBooking = await Booking.findOne({
      time,
      dates: { $in: dates }
    });

    if (existingBooking) {
      return res.status(400).json({
        error: 'Slot already booked for selected date(s) and time'
      });
    }

    // Create new booking
    const newBooking = new Booking({
      type,
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
    await sendMailToAdmin(savedBooking);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: savedBooking
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate booking detected'
      });
    }

    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
};

let availableSlots = async (req, res) => {
  try {
    const { date, type } = req.body;
    if (!date || !type) return res.status(400).json({ message: "Date and type are required." });

    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

    // Define winter range
    const decStart = new Date(`${targetDate.getFullYear()}-12-01`);
    const aprilEnd = new Date(`${targetDate.getFullYear() + 1}-04-15`);

    // Adjust for year crossing
    if (targetDate < decStart) {
      decStart.setFullYear(decStart.getFullYear() - 1);
      aprilEnd.setFullYear(aprilEnd.getFullYear() - 1);
    }

    let ALL_TIME_SLOTS = [];

    if (type === "banff-to-calgary") {
      if (targetDate >= decStart && targetDate <= aprilEnd) {
        // Winter banff-to-calgary
        ALL_TIME_SLOTS = ["12:00 PM"];
      } else {
        // Summer banff-to-calgary
        ALL_TIME_SLOTS = ["6:00 AM", "12:00 PM", "6:00 PM"];
      }
    } else if (type === "calgary-to-banff") {
      if (targetDate >= decStart && targetDate <= aprilEnd) {
        // Winter calgary-to-banff
        ALL_TIME_SLOTS = ["9:00 AM"];
      } else {
        // Summer calgary-to-banff
        ALL_TIME_SLOTS = ["9:00 AM", "3:00 PM"];
      }
    } else {
      return res.status(400).json({ message: "Invalid type provided." });
    }

    const bookings = await Booking.find({
      type, 
      $or: [
        {
          dateType: { $in: ["single", "multiple"] },
          dates: { $in: [targetDate] }
        },
        {
          dateType: "recurring",
          $or: [
            { "recurringInfo.repeatType": "daily" },
            { "recurringInfo.repeatType": `every-${dayName}`, "recurringInfo.timeToRepeat": 1 },
            {
              "recurringInfo.repeatType": "every_other_thursday",
              "recurringInfo.timeToRepeat": 2,
              "dates": { $in: [targetDate] }
            },
            {
              "recurringInfo.repeatType": "every-third-thursday",
              "recurringInfo.timeToRepeat": 3,
              "dates": { $in: [targetDate] }
            },
            {
              "recurringInfo.repeatType": "every-fourth-thursday",
              "recurringInfo.timeToRepeat": 4,
              "dates": { $in: [targetDate] }
            },
          ]
        }
      ]
    });
    

    const bookedSlots = bookings.flatMap((b) => b.time); // already booked times
const availableSlots = ALL_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot)); // only unbooked times


    res.json({ date, type, availableSlots });

  } catch (error) {
    console.error("Error checking available slots:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export { bookingSlot, availableSlots }