import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';  
import { db } from './config/db';
import router from './routes/userRoute';
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())


// // routes
app.use('/api',router)

export default app

