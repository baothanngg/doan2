import jwt from 'jsonwebtoken'
export const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') &&
      req.headers.authorization.split(' ')[1])

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token'
      })
    }

    req.userId = decoded.userId // Sửa: Gán đúng `userId` vào `req`
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired'
      })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Malformed token'
      })
    }
    console.error('Token verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}
