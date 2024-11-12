import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/Input'
import { Calendar, IdCard, Upload, User } from 'lucide-react'
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
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Xác Minh Bằng Thông Tin</h2>
      <form className="space-y-4 max-w-lg mx-auto">
        {/* Tên Người Nhận */}
        <Input1 icon={User} type="text" placeholder="Nhập tên người nhận" />

        {/* Mã Chứng Chỉ */}
        <Input1 icon={IdCard} type="text" placeholder="Nhập mã chứng chỉ" />

        {/* Ngày Cấp */}
        <Input1 icon={Calendar} type="date" />

        {/* Nút Xác Minh */}
        <button className="w-full py-2 mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg">
          Xác Minh
        </button>
      </form>
    </div>
  )
}

const VerifyByImage = () => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Xác Minh Bằng Hình Ảnh</h2>
      <form className="space-y-6 max-w-lg mx-auto">
        {/* Tải Lên Hình Ảnh */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-500 transition duration-200">
          <input
            type="file"
            accept="image/*"
            className="opacity-0 absolute inset-0 cursor-pointer"
          />
          <div className="flex items-center justify-center space-x-2">
            <Upload className="w-6 h-6 text-green-500" />
            <span className="text-gray-600 font-medium">Chọn Hình Ảnh</span>
          </div>
        </div>

        {/* Nút Xác Minh */}
        <button className="w-full py-3 mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Xác Minh</span>
        </button>
      </form>
    </div>
  )
}

export default VerifyPage
