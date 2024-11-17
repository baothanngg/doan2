// controllers/user.controller.js
import { User } from '../models/user.model.js'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email') // Chỉ lấy tên và email
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error })
  }
}
