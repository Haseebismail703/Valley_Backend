import Booking from "../model/bookingModel.js";
import sendMailToAdmin from "../utils/sendMail.js";
import Payment from "../model/paymentModel.js";

let bookingSlot =  async (req, res) => {
  const bookingData = req.body;
  try {
    const newBooking = new Booking(bookingData);
    await newBooking.save();

    // Send email to admin
    await sendMailToAdmin(bookingData);

    res.status(200).json({ success: true, message: "Slot booked successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Booking failed!" });
  }
};

let availableSlots = async (req, res) => {
    try {
        // Dummy slots for example
        const availableSlots = [
          {
            route: 'Route A',
            date: '2025-04-06',
            time: '10:00 AM',
            availableSeats: 5
          },
          {
            route: 'Route B',
            date: '2025-04-07',
            time: '2:00 PM',
            availableSeats: 3
          }
        ];
    
        res.status(200).json({ success: true, slots: availableSlots });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
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