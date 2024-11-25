import multer from 'multer'
import Certificate from '../models/certificate.model.js'
import { User } from '../models/user.model.js'
import { getContract } from '../utils/contract.js'
import { create } from 'ipfs-http-client'
import { getNextSequence } from '../utils/getNextSequence.js'
import { ethers, keccak256 } from 'ethers'
import Tesseract from 'tesseract.js'
import path from 'path'
import 'dotenv/config'
import axios from 'axios'

// Kết nối với IPFS
const ipfs = create({ host: '127.0.0.1', port: 5001, protocol: 'http' })

// Cấu hình multer để xử lý file upload
const upload = multer({ storage: multer.memoryStorage() })

const getProvider = async () => {
  const RPC_URLS = process.env.RPC_URLS.split(',')

  let provider
  for (const url of RPC_URLS) {
    try {
      provider = new ethers.JsonRpcProvider(url)
      await provider.getBlockNumber() // Kiểm tra kết nối
      console.log(`Kết nối thành công với node: ${url}`)
      return provider
    } catch (error) {
      console.error(`Không thể kết nối với node: ${url}`, error.message)
    }
  }

  throw new Error('Không thể kết nối với bất kỳ node nào!')
}

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

    // Tạo certificateId bằng cách sử dụng keccak256
    const data = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'string', 'uint256'],
      [recipientName, courseName, courseCode, issueDateTimestamp]
    )
    const certificateId = ethers.keccak256(data)

    // Gọi addCertificate và chờ giao dịch được xác nhận
    const tx = await contract.addCertificate(
      recipientName,
      courseName,
      courseCode,
      issueDateTimestamp,
      ipfsCID
    )
    console.log('Transaction hash:', tx.hash)

    // Kiểm tra xem giao dịch có được xác nhận không
    const provider = contract.provider || (await getProvider())

    const receipt = await provider.waitForTransaction(tx.hash, 1, 30000) // Timeout 30 giây
    if (!receipt || receipt.status === 0) {
      throw new Error('Giao dịch blockchain không thành công')
    }

    console.log('Giao dịch blockchain đã xác nhận:', receipt.transactionHash)

    // Lưu file chứng chỉ vào IPFS
    const fileBuffer = Buffer.from(dataUrl.split(',')[1], 'base64')
    const { cid } = await ipfs.add(
      { path: courseCode, content: fileBuffer },
      { pin: true }
    )

    // Thêm CID vào MFS (Mutable File System) để xuất hiện trong WebUI
    try {
      // Kiểm tra và xóa entry nếu tồn tại
      try {
        await ipfs.files.rm(`/${courseCode}`, { recursive: true })
        console.log(`Đã xóa entry hiện có: /${courseCode}`)
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`Entry /${courseCode} không tồn tại, tiếp tục.`)
        } else {
          throw error // Nếu lỗi khác, ném lỗi
        }
      }

      // Thực hiện sao chép file mới
      await ipfs.files.cp(`/ipfs/${cid.toString()}`, `/${courseCode}`)
      console.log(`File đã được sao chép vào: /${courseCode}`)
    } catch (error) {
      console.error(`Lỗi khi ghi đè file vào MFS:`, error.message)
    }

    // Lưu chứng chỉ vào MongoDB
    const certificate = new Certificate({
      userId,
      recipientName,
      courseName,
      courseCode,
      issueDate,
      ipfsCID: cid.toString(),
      blockchainTxHash: tx.hash // Lưu transaction hash vào MongoDB
    })
    await certificate.save()

    res.status(201).json({
      message: 'Chứng chỉ đã được cấp thành công',
      certificate,
      ipfsCID: cid.toString() // Trả về CID để frontend sử dụng
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
      '_id recipientName courseName issueDate blockchainTxHash'
    )

    const formattedData = certificates.map((cert, index) => ({
      id: String(index + 1).padStart(1, '0'),
      _id: cert._id, // Sử dụng ID thay vì CID
      name: cert.recipientName,
      certificate: cert.courseName,
      issuedDate: new Date(cert.issueDate).toLocaleDateString('vi-VN'), // Định dạng ngày,
      blockchainTxHash: cert.blockchainTxHash
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

export const tryExtractText = async (buffer) => {
  try {
    const { data } = await Tesseract.recognize(buffer, 'eng')
    return data.text
  } catch (error) {
    console.error('Lỗi khi trích xuất văn bản từ ảnh:', error.message)
    return null
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

export const getCertificateByTxHash = async (req, res) => {
  const { blockchainTxHash } = req.params
  const RPC_URLS = process.env.RPC_URLS.split(',')

  try {
    const provider = await getProvider()
    const tx = await provider.getTransaction(blockchainTxHash)

    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    // Lấy transaction receipt
    const receipt = await provider.getTransactionReceipt(blockchainTxHash)
    if (!receipt || !receipt.logs) {
      return res
        .status(404)
        .json({ message: 'Transaction receipt not found or has no logs' })
    }

    // Lấy thông tin block từ blockNumber
    const block = await provider.getBlock(receipt.blockNumber)
    if (!block) {
      return res.status(404).json({ message: 'Block not found' })
    }

    // Sử dụng JSON-RPC để lấy danh sách validator đã chấp thuận
    const blockNumberHex = `0x${receipt.blockNumber.toString(16)}` // Chuyển blockNumber sang hex
    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'ibft_getValidatorsByBlockNumber',
      params: [blockNumberHex],
      id: 1
    }

    // Gửi yêu cầu JSON-RPC qua URL từ biến môi trường
    const rpcResponse = await axios.post(RPC_URLS[0], rpcPayload)

    // Kiểm tra phản hồi từ JSON-RPC
    if (!rpcResponse.data || !rpcResponse.data.result) {
      throw new Error('Không thể lấy danh sách validator từ JSON-RPC')
    }

    const validatorAddresses = rpcResponse.data.result

    // Kết nối tới smart contract
    const contract = await getContract()

    // Tìm log của sự kiện CertificateAdded
    const eventTopic = ethers.keccak256(
      ethers.toUtf8Bytes(
        'CertificateAdded(bytes32,string,string,string,uint256,string,address)'
      )
    )

    const log = receipt.logs.find((log) => log.topics[0] === eventTopic)

    if (!log) {
      return res
        .status(404)
        .json({ message: 'Certificate not found in transaction logs' })
    }

    // Phân tích log
    let parsedLog
    try {
      parsedLog = contract.interface.parseLog(log)
    } catch (err) {
      console.error('Error parsing log:', err)
      return res
        .status(500)
        .json({ message: 'Error parsing log', error: err.message })
    }

    // Kiểm tra và xử lý issueDate
    let issueDate
    if (typeof parsedLog.args.issueDate === 'bigint') {
      issueDate = new Date(
        Number(parsedLog.args.issueDate) * 1000
      ).toISOString()
    } else if (parsedLog.args.issueDate._isBigNumber) {
      issueDate = new Date(
        parsedLog.args.issueDate.toNumber() * 1000
      ).toISOString()
    } else if (typeof parsedLog.args.issueDate === 'string') {
      issueDate = new Date(
        parseInt(parsedLog.args.issueDate, 10) * 1000
      ).toISOString()
    } else if (typeof parsedLog.args.issueDate === 'number') {
      issueDate = new Date(parsedLog.args.issueDate * 1000).toISOString()
    } else {
      throw new Error('Unsupported issueDate format')
    }

    // Tính phí giao dịch
    const gasUsed = BigInt(receipt.gasUsed.toString())
    const gasPrice = BigInt(tx.gasPrice.toString())
    const transactionFee = (gasUsed * gasPrice).toString() // Phí giao dịch bằng Wei
    const transactionFeeInEther = ethers.formatEther(transactionFee) // Chuyển sang Ether

    // Lấy thông tin miner
    const miner = block.miner

    // Tạo đối tượng chứng chỉ
    const certificate = {
      recipientName: parsedLog.args.recipientName,
      courseName: parsedLog.args.courseName,
      courseCode: parsedLog.args.courseCode,
      issueDate, // Sử dụng issueDate đã xử lý
      ipfsCID: parsedLog.args.ipfsCID,
      issuer: parsedLog.args.issuer,
      certificateId: parsedLog.args.certificateId,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: tx.gasPrice.toString(),
      transactionFee, // Phí giao dịch tính bằng Wei
      transactionFeeInEther, // Phí giao dịch tính bằng Ether
      miner, // Thông tin người đào
      validatorAddresses, // Địa chỉ các validator
      from: tx.from,
      to: tx.to,
      blockNumber: tx.blockNumber,
      transactionHash: tx.hash
    }

    res.status(200).json(certificate)
  } catch (error) {
    console.error('Error fetching certificate by transaction hash:', error)
    res.status(500).json({
      message: 'Error fetching certificate by transaction hash',
      error: error.message
    })
  }
}
