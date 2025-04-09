import express from "express";
import { bookingSlot ,availableSlots,savePaymentDetails} from "../controler/bookingControler.js";
const router = express.Router();

router.post('/slots/book',bookingSlot)
router.get('/slots/available',availableSlots)
router.post("/save-payment", savePaymentDetails);
export default router
