import multer from 'multer'
import Certificate from '../models/certificate.model.js'
import { User } from '../models/user.model.js'
import { getContract } from '../utils/contract.js'
import { create } from 'ipfs-http-client'
import { getNextSequence } from '../utils/getNextSequence.js'

// Kết nối với IPFS
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' })

// Cấu hình multer để xử lý file upload
const upload = multer({ storage: multer.memoryStorage() })

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
  const {
    userId,
    recipientName,
    courseName,
    issueDate,
    courseCode,
    dataUrl,
    ipfsCID
  } = req.body

  try {
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
      certificate,
      ipfsCID // Trả về CID để frontend sử dụng
    })
  } catch (error) {
    console.error('Lỗi khi cấp chứng chỉ:', error)
    res
      .status(500)
      .json({ message: 'Lỗi khi cấp chứng chỉ', error: error.message })
  }
}

export const verifyCertificate = async (req, res) => {
  const { courseCode } = req.query

  try {
    if (!courseCode) {
      throw new Error('CourseCode is required.')
    }

    // Kết nối với smart contract
    const contract = await getContract()
    if (!contract) {
      throw new Error('Không thể kết nối với smart contract')
    }

    // Gọi hàm getIpfsCIDByCourseCode để lấy ipfsCID
    const ipfsCID = await contract.getIpfsCIDByCourseCode(courseCode)

    if (!ipfsCID || ipfsCID === '') {
      throw new Error('Không tìm thấy chứng chỉ.')
    }

    // Chuyển hướng người dùng đến liên kết IPFS
    const ipfsUrl = `http://127.0.0.1:8080/ipfs/${ipfsCID}`
    res.redirect(ipfsUrl)
  } catch (error) {
    console.error('Lỗi khi xác thực chứng chỉ:', error)
    res.status(500).send('Đã xảy ra lỗi khi xác thực chứng chỉ.')
  }
}

export const getIssuedCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({}).select(
      '_id recipientName courseName issueDate'
    )

    const formattedData = certificates.map((cert, index) => ({
      id: String(index + 1).padStart(1, '0'),
      _id: cert._id, // Sử dụng ID thay vì CID
      name: cert.recipientName,
      certificate: cert.courseName,
      issuedDate: new Date(cert.issueDate).toLocaleDateString('vi-VN') // Định dạng ngày
    }))

    res.status(200).json({
      message: 'Danh sách chứng chỉ đã cấp',
      data: formattedData
    })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chứng chỉ:', error)
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách chứng chỉ',
      error: error.message
    })
  }
}

export const redirectToIPFS = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).select(
      'ipfsCID'
    )
    if (!certificate) {
      return res.status(404).json({ message: 'Chứng chỉ không tồn tại' })
    }

    const ipfsCID = certificate.ipfsCID
    const ipfsGatewayUrl = `http://127.0.0.1:8080/ipfs/${ipfsCID}`

    // Sử dụng fetch để lấy nội dung từ IPFS
    const response = await fetch(ipfsGatewayUrl)
    if (!response.ok) {
      throw new Error(
        `Không thể truy cập nội dung từ IPFS. HTTP status: ${response.status}`
      )
    }

    // Lấy nội dung từ IPFS
    const contentType = response.headers.get('content-type')
    const data = await response.arrayBuffer()
    const buffer = Buffer.from(data)

    // Trả về nội dung IPFS
    res.setHeader('Content-Type', contentType)
    res.send(buffer)
  } catch (error) {
    console.error('Lỗi khi lấy nội dung từ IPFS:', error.message)
    res.status(500).json({
      message: 'Lỗi khi lấy nội dung từ IPFS',
      error: error.message
    })
  }
}

export const verifyCertificateByInfo = async (req, res) => {
  const { recipientName, courseName, courseCode, issueDate } = req.body

  try {
    // Kết nối với smart contract
    const contract = await getContract()
    if (!contract) {
      throw new Error('Không thể kết nối với smart contract')
    }

    // Gọi hàm verifyCertificateByInfo trên smart contract
    const ipfsCID = await contract.verifyCertificateByInfo(
      recipientName,
      courseName,
      courseCode,
      Math.floor(new Date(issueDate).getTime() / 1000)
    )

    if (ipfsCID) {
      // Tìm chứng chỉ trong MongoDB để lấy _id
      const certificate = await Certificate.findOne({
        recipientName,
        courseName,
        courseCode,
        issueDate: new Date(issueDate)
      })

      if (!certificate) {
        return res.status(404).json({
          message: 'Chứng chỉ không tồn tại trong cơ sở dữ liệu'
        })
      }

      res.status(200).json({
        message: 'Chứng chỉ hợp lệ',
        viewLink: `http://localhost:5000/api/auth/view/${certificate._id}`
      })
    } else {
      res.status(404).json({
        message: 'Chứng chỉ không tồn tại'
      })
    }
  } catch (error) {
    console.error('Lỗi khi xác minh chứng chỉ:', error)
    res.status(500).json({
      message: 'Lỗi khi xác minh chứng chỉ hoặc chứng chỉ không tồn tại',
      error: error.message
    })
  }
}

export const verifyCertificateByImage = async (req, res) => {
  try {
    const { buffer } = req.file

    const result = await ipfs.add(buffer, { onlyHash: true })
    const ipfsCID = result.cid.toString()

    // Kết nối với smart contract
    const contract = await getContract()
    if (!contract) {
      throw new Error('Không thể kết nối với smart contract')
    }

    const isValid = await contract.verifyCertificateByCID(ipfsCID)

    if (isValid) {
      // Tìm chứng chỉ trong MongoDB để lấy _id
      const certificate = await Certificate.findOne({ ipfsCID })

      if (!certificate) {
        return res.status(404).json({
          message: 'Chứng chỉ không tồn tại trong cơ sở dữ liệu'
        })
      }

      res.status(200).json({
        message: 'Chứng chỉ hợp lệ',
        viewLink: `http://localhost:5000/api/auth/view/${certificate._id}`
      })
    } else {
      res.status(404).json({
        message: 'Chứng chỉ không tồn tại'
      })
    }
  } catch (error) {
    console.error('Lỗi khi xác minh chứng chỉ:', error)
    res.status(500).json({
      message: 'Lỗi khi xác minh chứng chỉ',
      error: error.message
    })
  }
}

export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.userId
    const certificates = await Certificate.find({ userId }).select(
      '_id recipientName courseName issueDate ipfsCID'
    )

    const formattedData = certificates.map((cert, index) => ({
      id: String(index + 1).padStart(1, '0'),
      _id: cert._id,
      name: cert.recipientName,
      certificate: cert.courseName,
      issuedDate: new Date(cert.issueDate).toLocaleDateString('vi-VN'),
      ipfsLink: `http://localhost:5000/api/auth/view/${cert._id}`
    }))

    res.status(200).json({
      message: 'Danh sách chứng chỉ của người dùng',
      data: formattedData
    })
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chứng chỉ:', error)
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách chứng chỉ',
      error: error.message
    })
  }
}
