import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  // Lấy token từ cookie hoặc header
  const token =
    req.cookies.token ||
    (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ') &&
      req.headers.authorization.split(' ')[1])

  // Kiểm tra nếu token không tồn tại
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    })
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token invalid'
      })
    }

    // Lưu userId vào req để dùng trong các route sau
    req.userId = decoded.userId
    next()
  } catch (error) {
    // Xử lý các lỗi JWT cụ thể
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token has expired'
      })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token is malformed'
      })
    } else {
      console.log('Verify token error:', error)
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
      })
    }
  }
}
