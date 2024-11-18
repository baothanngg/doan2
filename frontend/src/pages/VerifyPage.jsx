import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import { Calendar, IdCard, Ticket, Upload, User } from 'lucide-react'
import Input1 from '../components/Input1'

const VerifyPage = () => {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div className="flex flex-col h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Xác minh chứng chỉ</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/verify-certificates" className="hover:underline">
          Xác minh
        </Link>
      </nav>
      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`px-6 py-2 font-semibold rounded-lg ${
            activeTab === 'info' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Xác Minh Bằng Thông Tin
        </button>
        <button
          className={`px-6 py-2 font-semibold rounded-lg ${
            activeTab === 'image' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('image')}
        >
          Xác Minh Bằng Hình Ảnh
        </button>
      </div>

      {/* Nội dung của từng tab */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'info' ? <VerifyByInfo /> : <VerifyByImage />}
      </div>
    </div>
  )
}

const VerifyByInfo = () => {
  const [recipientName, setRecipientName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)

  const handleVerify = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/verify-certificate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientName,
            courseName,
            courseCode,
            issueDate
          })
        }
      )

      const result = await response.json()
      if (response.ok) {
        setVerificationResult(result)
      } else {
        setVerificationResult({ message: result.message })
      }
    } catch (error) {
      console.error('Lỗi khi xác minh chứng chỉ:', error)
      setVerificationResult({
        message: 'Đã có lỗi xảy ra khi xác minh chứng chỉ'
      })
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Xác Minh Bằng Thông Tin</h2>
      <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleVerify}>
        {/* Mã Chứng Chỉ */}
        <Input1
          icon={IdCard}
          type="text"
          placeholder="Nhập mã chứng chỉ"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
        />

        {/* Tên Người Nhận */}
        <Input1
          icon={User}
          type="text"
          placeholder="Nhập tên người nhận"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />

        {/* Tên Chứng Chỉ */}
        <Input1
          icon={Ticket}
          type="text"
          placeholder="Nhập tên chứng chỉ"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />

        {/* Ngày Cấp */}
        <Input1
          icon={Calendar}
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
        />

        {/* Nút Xác Minh */}
        <button className="w-full py-2 mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg">
          Xác Minh
        </button>
      </form>

      {verificationResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Kết Quả Xác Minh</h3>
          <p
            className={`${
              verificationResult.viewLink
                ? 'text-green-500 font-bold'
                : 'text-red-500 font-bold'
            }`}
          >
            {verificationResult.message}
          </p>
          {verificationResult.viewLink && (
            <a
              href={verificationResult.viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Xem Chứng Chỉ
            </a>
          )}
        </div>
      )}
    </div>
  )
}

const VerifyByImage = () => {
  const [image, setImage] = useState(null)
  const [verificationResult, setVerificationResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    setImage(file)
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!image) {
      alert('Vui lòng chọn hình ảnh')
      return
    }

    setIsLoading(true)
    setVerificationResult(null)

    const formData = new FormData()
    formData.append('image', image)

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/verify-image',
        {
          method: 'POST',
          body: formData
        }
      )

      const result = await response.json()
      setIsLoading(false)

      if (response.ok) {
        setVerificationResult(result)
      } else {
        setVerificationResult({ message: result.message })
      }
    } catch (error) {
      console.error('Lỗi khi xác minh chứng chỉ:', error)
      setIsLoading(false)
      setVerificationResult({
        message: 'Đã có lỗi xảy ra khi xác minh chứng chỉ'
      })
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Xác Minh Bằng Hình Ảnh</h2>
      <form className="space-y-6 max-w-lg mx-auto" onSubmit={handleVerify}>
        {/* Tải Lên Hình Ảnh */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-500 transition duration-200">
          <input
            type="file"
            accept="image/*"
            className="opacity-0 absolute inset-0 cursor-pointer"
            onChange={handleImageUpload}
          />
          <div className="flex items-center justify-center space-x-2">
            {image ? (
              <span className="text-gray-600 font-medium">{image.name}</span>
            ) : (
              <>
                <Upload className="w-6 h-6 text-green-500" />
                <span className="text-gray-600 font-medium">Chọn Hình Ảnh</span>
              </>
            )}
          </div>
        </div>

        {/* Nút Xác Minh */}
        <button
          type="submit"
          className="w-full py-3 mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Xác Minh</span>
        </button>
      </form>

      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-green-500 h-4 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 mt-2">Đang xử lý...</p>
        </div>
      )}

      {verificationResult && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Kết Quả Xác Minh</h3>
          <p
            className={`${
              verificationResult.viewLink ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {verificationResult.message}
          </p>
          {verificationResult.viewLink && (
            <a
              href={verificationResult.viewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Xem Chứng Chỉ
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default VerifyPage
