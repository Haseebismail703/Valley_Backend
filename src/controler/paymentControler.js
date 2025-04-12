import Stripe from "stripe";
import Payment from "../model/paymentModel.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let paymentSession =  async (req, res) => {
    const { amount , currency } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency,
            payment_method_types: ['card'],
        });
        let createPayment = await new Payment({amount  , currency})
         await createPayment.save()
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { paymentSession };