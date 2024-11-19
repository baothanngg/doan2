import Certificate from '../models/certificate.model.js'
import { User } from '../models/user.model.js'

export const getDashboardStats = async (req, res) => {
  try {
    // Tổng số chứng chỉ đã cấp
    const totalCertificates = await Certificate.countDocuments()

    // Tổng số tài khoản đang có
    const totalUsers = await User.countDocuments()

    // Chứng chỉ mới cấp trong vòng 1 ngày
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const newCertificates = await Certificate.countDocuments({
      issueDate: { $gte: oneDayAgo }
    })

    res.status(200).json({
      totalCertificates,
      totalUsers,
      newCertificates
    })
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thống kê:', error)
    res.status(500).json({
      message: 'Lỗi khi lấy dữ liệu thống kê',
      error: error.message
    })
  }
}

export const getNewCertificates = async (req, res) => {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const newCertificates = await Certificate.find({
      issueDate: { $gte: oneDayAgo }
    }).select('_id recipientName courseName issueDate')

    const formattedData = newCertificates.map((cert, index) => ({
      id: String(index + 1).padStart(1, '0'),
      _id: cert._id,
      recipientName: cert.recipientName,
      courseName: cert.courseName,
      issueDate: new Date(cert.issueDate).toLocaleDateString('vi-VN'),
      viewLink: `http://localhost:5000/api/auth/view/${cert._id}`
    }))

    res.status(200).json({
      message: 'Danh sách chứng chỉ mới cấp trong ngày',
      data: formattedData
    })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chứng chỉ mới cấp:', error)
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách chứng chỉ mới cấp',
      error: error.message
    })
  }
}
