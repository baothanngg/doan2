import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE
} from './emailTemplates.js'
import { transporter, sender } from './mailtrap.config.js'

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const mailOptions = {
      from: sender.email,
      to: email,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      )
    }

    const res = await transporter.sendMail(mailOptions)
    console.log('Verification email sent:', res)
  } catch (error) {
    console.log('Error sending verification email:', error)
    throw new Error(`Error sending verification email: ${error}`)
  }
}

export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: sender.email,
      to: email,
      subject: 'Welcome to Certificate Manager',
      html: `Hello ${name}, welcome to Certificate Manager!`
    }

    const res = await transporter.sendMail(mailOptions)
    console.log('Welcome email sent:', res)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw new Error(`Error sending welcome email: ${error}`)
  }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const mailOptions = {
      from: sender.email,
      to: email,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL)
    }

    const res = await transporter.sendMail(mailOptions)
    console.log('Password reset email sent:', res)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error(`Error sending password reset email: ${error}`)
  }
}

export const sendResetSuccessEmail = async (email) => {
  try {
    const mailOptions = {
      from: sender.email,
      to: email,
      subject: 'Password reset successful',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE
    }

    const res = await transporter.sendMail(mailOptions)
    console.log('Password reset success email sent:', res)
  } catch (error) {
    console.error('Error sending password reset success email:', error)
    throw new Error(`Error sending password reset success email: ${error}`)
  }
}
