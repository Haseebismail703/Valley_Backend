import express from 'express'
import cors from 'cors'
import { configDotenv } from 'dotenv'
import Db_connection from './src/confiq/db.js'
import route from './src/route/routes.js'
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

// Setup __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv()
const app = express()
app.use(express.json())
app.use(cookieParser());

const corsOptions = {
    origin: 'http://127.0.0.1:5500', 
    methods: ['GET', 'POST'],
    credentials: true
};

// ✅ Apply CORS middleware early (before all routes)
app.use(cors(corsOptions));

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000

// ✅ Payment Route
app.post("/create-checkout-session", async (req, res) => {
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
            success_url: "http://127.0.0.1:5500/sucessPayment.html",
            cancel_url: "http://127.0.0.1:5500/failed.html",
        });
        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use('/api', route)

const Db = Db_connection.connection
Db.on('error', console.error.bind(console, 'Error connection'))
Db.once('open', () => {
    console.log('Db connected');
})

app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
})
