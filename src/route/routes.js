import express from "express";
import { bookingSlot ,availableSlots,savePaymentDetails} from "../controler/bookingControler.js";
import { paymentSession } from "../controler/paymentControler.js";
const router = express.Router();

router.post('/slots/book',bookingSlot)
router.post('/slots/available',availableSlots)
router.post("/save-payment", savePaymentDetails);
router.post("/create-payment-intent", paymentSession);
export default router
