import express from 'express'
import cors from 'cors'
import { configDotenv } from 'dotenv'
import Db_connection from './src/confiq/db.js'
import route from './src/route/routes.js'
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";



// Setup __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv()
const app = express()
app.use(express.json())
app.use(cookieParser());

const corsOptions = {
    origin: ['http://127.0.0.1:5500',"https://bowvalleychauffeur.vercel.app","http://127.0.0.1:5500"], 
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000


app.use('/api', route)

const Db = Db_connection.connection
Db.on('error', console.error.bind(console, 'Error connection'))
Db.once('open', () => {
    console.log('Db connected');
})

app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
})
