import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1]
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: 'Unauthorized no token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: 'Unauthorized token invalid' })

    req.userId = decoded.userId
    next()
  } catch (error) {
    console.log('Verify token error:', error)
    return res
      .status(500)
      .json({
        success: false,
        message: 'Internal Server Error',
        error: error.message
      })
  }
}
