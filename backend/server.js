import express from 'express'
import { connectDB } from './db/connectDB.js'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'

dotenv.config()



const app = express()

const PORT = process.env.PORT || 5000

app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))

app.use(express.json()) // Phan tich dl JSON chuyen ve object JS cua: req.body
app.use(cookieParser()) // Phan tich cookie tu client

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  connectDB()
  console.log('Server is running on port 5000')
})
