import Booking from "../model/bookingModel.js";
import sendMailToAdmin from "../utils/sendMail.js";
import Payment from "../model/paymentModel.js";

let bookingSlot =  async (req, res) => {
  try {
    const {
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
      notes,
    } = req.body;

    // Check if already booked
    const existing = await Booking.findOne({
      time,
      $or: [
        { dates: { $in: dates.map(d => new Date(d)) } },
        { dateType: "recurring", recurringInfo: { $exists: true }, time }
      ]
    });

    if (existing) {
      return res.status(409).json({ message: "Time slot already booked" });
    }

    const booking = new Booking({
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
      notes,
    });

    await booking.save();

    res.status(201).json({ message: "Booking successful", booking });

  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

let availableSlots = async (req, res) => {
  const ALL_TIME_SLOTS = ["6 PM", "12 PM", "12 AM"]; // Define all available time slots

  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required." });
  
    const targetDate = new Date(date);
    const dayName = targetDate.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(); // Get the day name (e.g., 'monday')
    const dateOfMonth = targetDate.getDate();
    const month = targetDate.getMonth();
    const year = targetDate.getFullYear();
    
    const bookings = await Booking.find({
      $or: [
        // Single date or multiple
        { 
          dateType: { $in: ["single", "multiple"] },
          dates: { $in: [targetDate] }
        },
        // Recurring bookings
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
  
    // Extract booked slots
    const bookedSlots = bookings.map((b) => b.time);
    
    // Get available slots
    const availableSlots = ALL_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));
  
    res.json({ date, availableSlots });
  
  } catch (error) {
    console.error("Error checking available slots:", error);
    res.status(500).json({ message: "Server error" });
  }
  
}

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
export {bookingSlot,availableSlots,savePaymentDetails}