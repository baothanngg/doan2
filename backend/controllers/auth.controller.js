 import { User } from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail
} from '../mailtrap/emails.js'
import crypto from 'crypto'
import 'dotenv/config'

export const signup = async (req, res) => {
  const { email, password, name } = req.body
  try {
    if (!email || !password || !name) {
      throw new Error('Please fill in all fields')
    }

    const userAlreadyExists = await User.findOne({ email })
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists' })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 gio
    })

    await user.save()

    // jwt
    generateTokenAndSetCookie(res, user._id)

    await sendVerificationEmail(user.email, verificationToken)

    // 201 = created
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const verifyEmail = async (req, res) => {
  const { code } = req.body

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      })
    }

    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiresAt = undefined
    await user.save()

    await sendWelcomeEmail(user.email, user.name)

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password' })
    }

    const isPassword = await bcryptjs.compare(password, user.password)
    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid password' })
    }

    generateTokenAndSetCookie(res, user._id)

    user.lastLogin = new Date()
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    console.log('Login error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const logout = async (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ success: true, message: 'Logged out successfully' })
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const resetPasswordToken = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 gio

    user.resetPasswordToken = resetPasswordToken
    user.resetPasswordExpiresAt = resetTokenExpiresAt

    await user.save()

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`
    )

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    })
  } catch (error) {
    console.log('Forgot password error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }
    })

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired reset token' })
    }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10)

    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiresAt = undefined
    await user.save()

    await sendResetSuccessEmail(user.email)

    return res
      .status(200)
      .json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.log('Reset password error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }
    return res.status(200).json({ success: true, user })
  } catch (error) {
    console.log('Check auth error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}
