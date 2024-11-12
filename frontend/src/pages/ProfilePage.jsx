import React from 'react'
import { Link } from 'react-router-dom'

const ProfilePage = () => {
  return (
    <div className="flex flex-col h-screen p-8">
      <h1 className="text-2xl font-bold ">Hồ sơ người dùng</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/profile" className="hover:underline">
          Hồ sơ
        </Link>
      </nav>
      <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-auto  bg-white shadow-xl rounded-lg text-gray-900">
        {/* Ảnh bìa */}
        <div className="rounded-t-lg h-32 overflow-hidden">
          <img
            className="object-cover object-top w-full"
            src="https://images.unsplash.com/photo-1549880338-65ddcdfd017b?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
            alt="Mountain"
          />
        </div>

        {/* Avatar */}
        <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
          <img
            className="object-cover object-center h-32"
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
            alt="User Avatar"
          />
        </div>

        {/* Tên và email */}
        <div className="text-center mt-2">
          <h2 className="font-semibold">Sarah Smith</h2>
          <p className="text-gray-500">sarah.smith@example.com</p>
        </div>

        {/* Form chỉnh sửa thông tin */}
        <form className="p-4 mx-8 mt-2 space-y-4">
          {/* Ô chỉnh sửa tên */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Họ tên
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              defaultValue="Sarah Smith"
            />
          </div>

          {/* Ô chỉnh sửa email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              defaultValue="sarah.smith@example.com"
              disabled
            />
          </div>

          {/* Ô chỉnh sửa mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          {/* Ô nhập mật khẩu mới */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu mới
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          {/* Ô xác nhận mật khẩu mới */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Nhập lại mât khẩu mới
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {/* Nút lưu */}
          <div className="pt-4">
            <button className="w-full rounded-full bg-gray-900 hover:shadow-lg font-semibold text-white px-6 py-2">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage
