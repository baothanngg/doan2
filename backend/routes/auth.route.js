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
  updateName,
  generate2FA,
  toggle2FA,
  get2FAStatus,
  verifyTwoFactor
} from '../controllers/auth.controller.js'
import { verifyToken } from '../middleware/verifyToken.js'
import {
  finalizeCertificateIssue,
  getCertificateByTxHash,
  getIssuedCertificates,
  getUserCertificates,
  issueCertificate,
  redirectToIPFS,
  verifyCertificate,
  verifyCertificateByImage,
  verifyCertificateByInfo
} from '../controllers/certificate.controller.js'
import { getUsers } from '../controllers/user.controller.js'
import {
  getDashboardStats,
  getNewCertificates
} from '../controllers/dashboard.controller.js'

import {
  getNodeStatus,
  startNode,
  stopNode,
  getBlocksWithTransactions
} from '../controllers/blockchain.controller.js'

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

router.post('/generate-2fa', generate2FA)

router.post('/toggle-2fa', toggle2FA)

router.post('/verify-image', upload.single('image'), verifyCertificateByImage)

router.post('/verify-2fa', verifyTwoFactor)

router.get('/verify', verifyCertificate)

router.get('/2fa-status', verifyToken, get2FAStatus)

router.get('/certificates', getIssuedCertificates)

router.get('/users', getUsers)

router.get('/view/:id', redirectToIPFS)

router.get('/user-certificates', verifyToken, getUserCertificates)

router.get('/stats', verifyToken, getDashboardStats)

router.get('/new-certificates', verifyToken, getNewCertificates)

router.get('/certificate/:blockchainTxHash', getCertificateByTxHash)

router.get('/nodes', getNodeStatus) // Lấy trạng thái node
router.post('/nodes/:nodeId/start', startNode) // Bật node
router.post('/nodes/:nodeId/stop', stopNode) // Tắt node
router.get('/blocks', getBlocksWithTransactions) // Lấy block có dữ liệu

export default router
