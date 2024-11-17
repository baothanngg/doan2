// models/Certificate.js
import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientName: {
      type: String,
      required: true
    },
    courseName: {
      type: String,
      required: true
    },
    courseCode: {
      type: String,
      required: true,
      unique: true // Đảm bảo mã chứng chỉ là duy nhất
    },
    issueDate: {
      type: Date,
      required: true
    },
    ipfsCID: {
      type: String,
      required: true
    },
    blockchainTxHash: {
      type: String,
      required: true // Thêm trường này để lưu transaction hash
    }
  },
  { timestamps: true }
)

const Certificate = mongoose.model('Certificate', certificateSchema)

export default Certificate
