import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';  
import { db } from './config/db';
dotenv.config()

db
const app = express()
app.use(express.json())
app.use(cors())


export default app

