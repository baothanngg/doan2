import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import Avatar from 'react-avatar'
import { Pencil, Check } from 'lucide-react'

const ProfilePage = () => {
  const { user, updatePassword } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newName, setNewName] = useState(user?.name || '')
  const [isEditing, setIsEditing] = useState(false)

  const { updateName } = useAuthStore()

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp')
      return
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      )
      return
    }

    try {
      await updatePassword(currentPassword, newPassword)
      toast.success('Đổi mật khẩu thành công')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Đổi mật khẩu thất bại')
    }
  }

  const handleNameChange = async () => {
    if (!newName.trim()) {
      toast.error('Tên không được để trống')
      return
    }

    try {
      await updateName(newName) // Gọi API cập nhật tên
      toast.success('Cập nhật họ tên thành công')
      setIsEditing(false)
      user.name = newName
    } catch (error) {
      console.error('Lỗi khi cập nhật họ tên:', error)
      toast.error('Cập nhật họ tên thất bại')
    }
  }

  return (
    <div className="flex flex-col p-8">
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
      <div className="max-w-2xl mx-4 sm:max-w-sm md:max-w-sm lg:max-w-sm xl:max-w-sm sm:mx-auto md:mx-auto lg:mx-auto xl:mx-aut  bg-white shadow-xl rounded-lg text-gray-900">
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
          <Avatar
            name={user?.name}
            size="128"
            round={true}
            color={Avatar.getRandomColor('sitebase')}
          />
        </div>

        {/* Tên và email */}
        <div className="text-center mt-2">
          {/* Phần hiển thị/chỉnh sửa tên */}
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleNameChange}
                  className="text-green-500 hover:text-green-700"
                  aria-label="Save"
                >
                  <Check size={20} />
                </button>
              </>
            ) : (
              <>
                <h2 className="font-semibold">{user?.name}</h2>
                <button
                  onClick={() => {
                    setIsEditing(true)
                    setNewName(user?.name)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Edit"
                >
                  <Pencil size={20} />
                </button>
              </>
            )}
          </div>

          {/* Email luôn hiển thị */}
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* Form chỉnh sửa thông tin */}
        <form
          className="p-4 mx-8 mt-2 space-y-4"
          onSubmit={handlePasswordChange}
        >
          {/* Ô chỉnh sửa tên */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Họ tên
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              value={isEditing ? newName : user?.name}
              disabled
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
              defaultValue={user?.email}
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
              value={currentPassword}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              placeholder="Nhập mật khẩu hiện tại"
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          {/* Ô nhập mật khẩu mới */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              placeholder="Nhập mật khẩu mới"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {/* Ô xác nhận mật khẩu mới */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Nhập lại mât khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:border-blue-500"
              placeholder="Nhập lại mật khẩu mới"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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
