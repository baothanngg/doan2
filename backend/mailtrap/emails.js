import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE
} from './emailTemplates.js'
import { mailtrapClient, sender } from './mailtrap.config.js'

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }]

  try {
    const res = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Verify your email',
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      ),
      category: 'Email Verification'
    })

    console.log(res)
  } catch (error) {
    console.log('Error sending verification email:', error)
    throw new Error(`Error sending verification email: ${error}`)
  }
}

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }]
  try {
    console.log('Sending welcome email...')
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: '5b751572-7b56-4da1-89f1-0198c5a000c3',
      template_variables: {
        company_info_name: 'Certificate Manager',
        name: name
      }
    })
    console.log('Email sent:', response)
  } catch (error) {
    console.error('Error sending welcome email:', error)
    throw new Error(`Error sending welcome email: ${error}`)
  }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
  const recipient = [{ email }]

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Reset your password',
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetURL),
      category: 'Password Reset'
    })
  } catch (error) {}
}

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }]

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Password reset successful',
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: 'Password Reset'
    })

    console.log('Password reset successfully:', response)
  } catch (error) {
    console.error('Error sending password reset success email:', error)
    throw new Error(`Error sending password reset success email: ${error}`)
  }
}
