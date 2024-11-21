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
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

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
  const { email, password, twoFactorCode } = req.body

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

    if (user.is2FAEnabled && user.twoFactorSecret && !twoFactorCode) {
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        user: {
          email: user.email,
          _id: user._id
        },
        message: 'Two-factor authentication required'
      })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    user.lastLogin = new Date()
    user.isActive = true
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined,
        twoFactorSecret: undefined
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const generate2FA = async (req, res) => {
  const { userId } = req.body

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // Nếu mã bí mật đã tồn tại, không tạo mới
    if (user.twoFactorSecret) {
      return res.status(200).json({
        success: true,
        secret: user.twoFactorSecret, // Trả lại mã cũ
        message: 'Two-factor authentication already enabled'
      })
    }

    // Tạo mã bí mật mới nếu chưa tồn tại
    const secret = speakeasy.generateSecret({ length: 20 })
    user.twoFactorSecret = secret.base32
    await user.save()

    return res.status(200).json({
      success: true,
      secret: secret.base32, // Trả mã mới
      otpauthUrl: secret.otpauth_url
    })
  } catch (error) {
    console.error('Error generating 2FA secret:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const toggle2FA = async (req, res) => {
  const { userId, is2FAEnabled } = req.body

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.is2FAEnabled = is2FAEnabled

    let secret = null
    let otpauthUrl = null

    // Nếu bật 2FA và chưa có mã bí mật, tạo mã mới
    if (is2FAEnabled) {
      if (!user.twoFactorSecret) {
        const generatedSecret = speakeasy.generateSecret({
          length: 20,
          name: `Certificate:(${user.email})` // Tên hiển thị trong Google Authenticator
        })
        user.twoFactorSecret = generatedSecret.base32
        otpauthUrl = generatedSecret.otpauth_url
      } else {
        // Nếu đã có mã bí mật, tái tạo URL mã QR
        otpauthUrl = speakeasy.otpauthURL({
          secret: user.twoFactorSecret,
          label: `Certificate:(${user.email})`,
          issuer: ''
        })
      }
      secret = user.twoFactorSecret
    } else {
      // Nếu tắt 2FA, chỉ cập nhật trạng thái, không xóa mã
      secret = null
      otpauthUrl = null
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: `Two-factor authentication has been ${
        is2FAEnabled ? 'enabled' : 'disabled'
      }`,
      secret,
      otpauthUrl
    })
  } catch (error) {
    console.error('Error toggling 2FA:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const get2FAStatus = async (req, res) => {
  const userId = req.userId // Lấy userId từ middleware `verifyToken`

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized: No user ID provided' })
  }

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      is2FAEnabled: user.is2FAEnabled, // Trạng thái 2FA
      secret: user.twoFactorSecret, // Trả về mã bí mật (nếu cần)
      otpauthUrl: user.is2FAEnabled
        ? `otpauth://totp/MyApp?secret=${user.twoFactorSecret}&issuer=MyApp`
        : null // URL QR Code nếu đang bật
    })
  } catch (error) {
    console.error('Error fetching 2FA status:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const verifyTwoFactor = async (req, res) => {
  const { twoFactorCode, userId } = req.body

  if (!twoFactorCode || !userId) {
    return res.status(400).json({ success: false, message: 'Invalid request' })
  }

  try {
    const user = await User.findById(userId)
    if (!user || !user.twoFactorSecret) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found or 2FA not enabled' })
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorCode
    })

    if (!verified) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid two-factor code' })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    })

    user.isActive = true
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Two-factor authentication verified',
      token
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
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

export const updateName = async (req, res) => {
  const { newName } = req.body
  const userId = req.userId

  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' })
    }

    user.name = newName
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Name updated successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    console.log('Update name error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}
