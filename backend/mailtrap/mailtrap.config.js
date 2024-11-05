import nodemailer from 'nodemailer'
import 'dotenv/config'

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD
  }
})

export const sender = {
  email: GMAIL_USER,
  name: 'Admin Certificate Manager'
}
