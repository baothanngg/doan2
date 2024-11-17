import express from 'express'
import {
  signup,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  updatePassword,
  getAllUsers,
  toggleUserLock
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { finalizeCertificateIssue, issueCertificate } from '../controllers/certificate.controller.js'
import { getUsers } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/check-auth', verifyToken, checkAuth)

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', verifyToken, logout)

router.post('/verify-email', verifyEmail)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password/:token', resetPassword)

router.post('/update-password', verifyToken, updatePassword)

router.get('/users', getAllUsers)

router.post('/toggle-lock/:userId', verifyToken, toggleUserLock)

router.post('/issue', issueCertificate)

router.post('/finalize', finalizeCertificateIssue)

router.get('/users', getUsers)

export default router
