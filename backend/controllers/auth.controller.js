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

    if (user.isLocked) {
      return res
        .status(403)
        .json({ success: false, message: 'Your account is locked' })
    }

    generateTokenAndSetCookie(res, user._id)

    user.lastLogin = new Date()
    user.isActive = true
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
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    user.isActive = false
    await user.save()

    res.clearCookie('token')
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.log('Logout error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
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

export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.userId

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    const isPassword = await bcryptjs.compare(currentPassword, user.password)
    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Current password is incorrect' })
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    user.password = hashedPassword
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.log('Update password error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password')
    const usersWithActivity = users.map((user) => {
      if (user.isActive) {
        return {
          ...user._doc,
          activity: 'Đang hoạt động'
        }
      } else {
        const lastLogin = user.lastLogin || new Date()
        const now = new Date()
        const diffMs = now - lastLogin
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        )
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        )
        let activity = ''

        if (diffDays > 0) {
          activity = `${diffDays} ngày trước`
        } else if (diffHours > 0) {
          activity = `${diffHours} giờ trước`
        } else {
          activity = `${diffMinutes} phút trước`
        }

        return {
          ...user._doc,
          activity
        }
      }
    })
    return res.status(200).json({ success: true, users: usersWithActivity })
  } catch (error) {
    console.log('Get all users error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const toggleUserLock = async (req, res) => {
  const { userId } = req.params

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    user.isLocked = !user.isLocked
    await user.save()

    return res.status(200).json({
      success: true,
      message: `User ${user.isLocked ? 'locked' : 'unlocked'} successfully`,
      user
    })
  } catch (error) {
    console.log('Toggle user lock error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}
