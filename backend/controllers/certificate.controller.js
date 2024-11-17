import Certificate from '../models/certificate.model.js'
import { User } from '../models/user.model.js'
import { getContract } from '../utils/contract.js'
import { create } from 'ipfs-http-client'
import { getNextSequence } from '../utils/getNextSequence.js'

// Kết nối với IPFS
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' })

export const issueCertificate = async (req, res) => {
  const { userId, recipientName, courseName, issueDate } = req.body

  try {
    // Kiểm tra người dùng có tồn tại
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' })
    }

    // Lấy số thứ tự tăng dần cho `courseCode`
    const seq = await getNextSequence('courseCode')
    const courseCode = `VLUTE-${String(seq).padStart(3, '0')}`

    // Trả về `courseCode` cho frontend mà không lưu ảnh lên IPFS
    res.status(201).json({
      message: 'Tạo mã courseCode thành công',
      courseCode
    })
  } catch (error) {
    console.error('Lỗi khi tạo courseCode:', error)
    res.status(500).json({ message: 'Lỗi khi tạo courseCode', error })
  }
}

export const finalizeCertificateIssue = async (req, res) => {
  const { userId, recipientName, courseName, issueDate, courseCode, dataUrl } =
    req.body

  try {
    // Tách phần Base64 từ dataUrl và lưu lên IPFS
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const result = await ipfs.add(buffer)
    const ipfsCID = result.cid.toString()

    // Kết nối với smart contract
    const contract = await getContract()
    if (!contract) {
      throw new Error('Không thể kết nối với smart contract')
    }

    const issueDateTimestamp = Math.floor(new Date(issueDate).getTime() / 1000)

    // Gọi addCertificate và lấy transaction hash
    const tx = await contract.addCertificate(
      recipientName,
      courseName,
      courseCode,
      issueDateTimestamp,
      ipfsCID
    )
    console.log('Transaction hash:', tx.hash)

    // Lưu chứng chỉ vào MongoDB
    const certificate = new Certificate({
      userId,
      recipientName,
      courseName,
      courseCode,
      issueDate,
      ipfsCID,
      blockchainTxHash: tx.hash // Lưu transaction hash vào MongoDB
    })
    await certificate.save()

    res.status(201).json({
      message: 'Chứng chỉ đã được cấp thành công',
      certificate
    })
  } catch (error) {
    console.error('Lỗi khi cấp chứng chỉ:', error)
    res
      .status(500)
      .json({ message: 'Lỗi khi cấp chứng chỉ', error: error.message })
  }
}
