import express from "express";
import { bookingSlot ,availableSlots,savePaymentDetails} from "../controler/bookingControler.js";
import { paymentSession } from "../controler/paymentControler.js";
const router = express.Router();

router.post('/slots/book',bookingSlot)
router.get('/slots/available',availableSlots)
router.post("/save-payment", savePaymentDetails);
router.post("/create-checkout-session", paymentSession);
export default router
