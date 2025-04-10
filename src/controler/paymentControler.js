import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let paymentSession =  async (req, res) => {
    const { amount } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Test Product",
                        },
                        unit_amount: amount, // $10.00
                    },
                    quantity: 1,
                },
            ],
            success_url: "https://icpih.com/media-intestinal-health-ihsig/PAYMENT-SUCCESS.png",
            cancel_url: "http://127.0.0.1:5500/failed.html",
        });
        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export { paymentSession };