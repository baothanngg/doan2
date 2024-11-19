import express from 'express'
import multer from 'multer'
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
  toggleUserLock,
  updateName
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import {
  finalizeCertificateIssue,
  getIssuedCertificates,
  getUserCertificates,
  issueCertificate,
  redirectToIPFS,
  verifyCertificateByImage,
  verifyCertificateByInfo
} from '../controllers/certificate.controller.js'
import { getUsers } from '../controllers/user.controller.js'
import { getDashboardStats, getNewCertificates } from '../controllers/dashboard.controller.js'

const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.get('/check-auth', verifyToken, checkAuth)

router.post('/signup', signup)

router.post('/login', login)

router.post('/logout', verifyToken, logout)

router.post('/verify-email', verifyEmail)

router.post('/forgot-password', forgotPassword)

router.post('/reset-password/:token', resetPassword)

router.post('/update-password', verifyToken, updatePassword)

router.post('/update-name', verifyToken, updateName)

router.get('/users', getAllUsers)

router.post('/toggle-lock/:userId', verifyToken, toggleUserLock)

router.post('/issue', issueCertificate)

router.post('/finalize', finalizeCertificateIssue)

router.post('/verify-certificate', verifyCertificateByInfo)

router.post('/verify-image', upload.single('image'), verifyCertificateByImage)

router.get('/certificates', getIssuedCertificates)

router.get('/users', getUsers)

router.get('/view/:id', redirectToIPFS)

router.get('/user-certificates', verifyToken, getUserCertificates)

router.get('/stats', verifyToken, getDashboardStats)

router.get('/new-certificates', verifyToken, getNewCertificates)

export default router
