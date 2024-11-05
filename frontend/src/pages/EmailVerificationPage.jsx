import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const EmailVerificationPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])
  const navigate = useNavigate()

  const { error, isLoading, verifyEmail } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const verificationCode = code.join('')

    try {
      await verifyEmail(verificationCode)
      navigate('/')
      toast.success('Email verified successfully')
    } catch (error) {
      console.log(error)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault()
      inputRefs.current.forEach((input) => input.select())
    }
    if (
      e.key === 'Backspace' &&
      e.target.selectionStart === 0 &&
      e.target.selectionEnd === e.target.value.length
    ) {
      setCode(Array(6).fill(''))
      inputRefs.current[0].focus()
    }
  }

  const handleChange = (index, value) => {
    const newCode = [...code]
    // Xử lý paste code
    if (value.length > 1 && index == 0) {
      const pastedCode = value.slice(0, 6).split('')

      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || ''
      }
      setCode(newCode)

      // Điều chỉnh trỏ chuột
      const lastIndex = newCode.findLastIndex((digit) => digit !== '') // Duyet tu cuoi len dau mang
      const focusIndex = lastIndex < 5 ? lastIndex + 1 : 5
      inputRefs.current[focusIndex].focus()
    } else {
      newCode[index] = value.slice(0, 1)
      setCode(newCode)
      // Nếu đã có đủ 6 ký tự, không di chuyển con trỏ nữa
      const filledCount = newCode.filter((digit) => digit !== '').length
      if (filledCount < 6 && value && index < 5) {
        inputRefs.current[index + 1].focus()
      }
    }
  }

  return (
    <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-300 mb-6">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
              />
            ))}
          </div>
          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            Verify Email
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default EmailVerificationPage
