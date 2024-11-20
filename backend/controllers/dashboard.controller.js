import Certificate from '../models/certificate.model.js'
import { User } from '../models/user.model.js'

export const getDashboardStats = async (req, res) => {
  try {
    // Tổng số chứng chỉ đã cấp
    const totalCertificates = await Certificate.countDocuments()

    // Tổng số tài khoản đang có
    const totalUsers = await User.countDocuments()

    // Lấy thời gian đầu và cuối của ngày hôm nay
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0) // Đặt giờ thành 00:00:00

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999) // Đặt giờ thành 23:59:59

    // Chứng chỉ được cấp trong ngày hôm nay
    const newCertificates = await Certificate.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday } // Lọc theo createdAt trong ngày hôm nay
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
    // Lấy thời gian đầu và cuối của ngày hôm nay
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0) // Đặt giờ thành 00:00:00

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999) // Đặt giờ thành 23:59:59

    // Tìm chứng chỉ được tạo trong ngày hôm nay, sắp xếp theo createdAt giảm dần
    const newCertificates = await Certificate.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday } // Lọc theo createdAt trong ngày hôm nay
    })
      .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo createdAt
      .select('_id recipientName courseName issueDate blockchainTxHash') // Chỉ chọn các trường cần thiết

    // Định dạng dữ liệu
    const formattedData = newCertificates.map((cert, index) => ({
      id: String(index + 1).padStart(1, '0'), // Đánh số thứ tự
      _id: cert._id,
      recipientName: cert.recipientName,
      courseName: cert.courseName,
      issueDate: new Date(cert.issueDate).toLocaleDateString('vi-VN'), // Định dạng issueDate
      viewLink: `http://localhost:5000/api/auth/view/${cert._id}`,
      blockchainTxHash: cert.blockchainTxHash
    }))

    res.status(200).json({
      message: 'Danh sách chứng chỉ mới cấp trong ngày hôm nay',
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
