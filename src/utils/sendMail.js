import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendMailToAdmin = async (bookingData) => {
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user:  process.env.ADMIN_EMAIL,
      pass: process.env.GMAIL_PASSWORD,
    }
  });

  const formattedDates = bookingData.dates?.length
  ? bookingData.dates.map(date => new Date(date).toLocaleDateString()).join(", ")
  : "N/A";

const formattedTimes = bookingData.time?.length
  ? bookingData.time.join(", ")
  : "N/A";

const mailOptions = {
  from: `Booking Portal <${process.env.SENDER_EMAIL}>`,
  to: process.env.ADMIN_EMAIL,
  subject: "🚐 New Slot Booking Received",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f7f7f7; border-radius: 8px;">
      <div style="background-color: #004aad; padding: 15px 25px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0;">📩 New Booking Alert</h2>
      </div>
      <div style="background-color: #fff; padding: 25px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <p><strong>Name:</strong> ${bookingData.firstName} ${bookingData.lastName}</p>
        <p><strong>Route:</strong> ${bookingData.route}</p>
        <p><strong>Pickup Location:</strong> ${bookingData.pickupLocation}</p>
        <p><strong>Drop-off Location:</strong> ${bookingData.dropoffLocation}</p>
        <p><strong>Date Type:</strong> ${bookingData.dateType}</p>
        <p><strong>Dates:</strong> ${formattedDates}</p>
        <p><strong>Time(s):</strong> ${formattedTimes}</p>
        <p><strong>Passengers:</strong> ${bookingData.passengers}</p>
        <p><strong>Phone:</strong> ${bookingData.phoneNumber}</p>
        <p><strong>Email(s):</strong> ${bookingData.email.join(", ")}</p>
        <p><strong>Mobile on Pickup Day:</strong> ${bookingData.mobileOnPickupDay || "N/A"}</p>
        <p><strong>Notes:</strong> ${bookingData.notes || "N/A"}</p>
       <p><strong>Slot Booked date:</strong> ${bookingData.createdAt}</p>
      </div>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 15px;">Booking Portal System</p>
    </div>
  `,
};
  await transporter.sendMail(mailOptions);
};

export default sendMailToAdmin;
