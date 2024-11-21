import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

const CustomSwitch = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-300 ${
      enabled ? 'bg-blue-500' : 'bg-gray-300'
    }`}
  >
    <span
      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-300 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    ></span>
  </button>
)

const SettingPage = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [secret, setSecret] = useState(null)
  const [qrCodeUrl, setQrCodeUrl] = useState(null) // URL mã QR
  const { user } = useAuthStore()

  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('Token không tồn tại trong localStorage')
          return
        }

        const response = await fetch(
          'http://localhost:5000/api/auth/2fa-status',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        )
        const data = await response.json()
        if (data.success) {
          setIs2FAEnabled(data.is2FAEnabled) // Cập nhật trạng thái 2FA
          setSecret(data.secret) // Cập nhật mã bí mật
          if (data.otpauthUrl) {
            QRCode.toDataURL(data.otpauthUrl, (err, url) => {
              if (err) {
                console.error('Lỗi khi tạo QR Code:', err)
                return
              }
              setQrCodeUrl(url) // Cập nhật URL QR Code
            })
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy trạng thái 2FA:', error)
      }
    }
    fetch2FAStatus()
  }, [])

  const handleToggle2FA = async () => {
    if (!user?._id) {
      console.error('Không tìm thấy ID người dùng')
      return
    }

    try {
      const new2FAStatus = !is2FAEnabled
      const response = await fetch(
        'http://localhost:5000/api/auth/toggle-2fa',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: user._id,
            is2FAEnabled: new2FAStatus
          })
        }
      )
      const data = await response.json()
      if (data.success) {
        setIs2FAEnabled(new2FAStatus)
        toast.success(`2FA đã ${new2FAStatus ? 'bật' : 'tắt'} thành công!`)

        if (new2FAStatus) {
          setSecret(data.secret)

          // Tạo QR Code URL từ mã bí mật (secret)
          QRCode.toDataURL(data.otpauthUrl, (err, url) => {
            if (err) {
              console.error('Lỗi khi tạo QR Code:', err)
              return
            }
            setQrCodeUrl(url)
          })
        } else {
          setSecret(null)
          setQrCodeUrl(null)
        }
      } else {
        console.error(data.message)
      }
    } catch (error) {
      console.error('Lỗi khi bật/tắt 2FA:', error)
    }
  }

  return (
    <div className="flex flex-col h-fit p-8">
      <h1 className="text-2xl font-bold mb-4">Cài đặt</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/setting" className="hover:underline">
          Cài đặt
        </Link>
      </nav>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Bảo mật</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700">Bật chế độ xác thực 2 bước</span>
          <CustomSwitch enabled={is2FAEnabled} onToggle={handleToggle2FA} />
        </div>
        {is2FAEnabled && secret && (
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-gray-700 font-medium">Mã bí mật (Secret):</p>
            <p className="text-gray-900 font-mono">{secret}</p>
            <p className="text-sm text-gray-500">
              Nhập mã này vào ứng dụng Google Authenticator của bạn.
            </p>
            {qrCodeUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingPage
