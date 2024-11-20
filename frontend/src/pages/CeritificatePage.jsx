import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MUIDataTable from 'mui-datatables'
import QRCode from 'qrcode'
import axios from 'axios'
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'

const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' })

const CertificatePage = () => {
  const [activeTab, setActiveTab] = useState('new')

  return (
    <div
      className={`flex flex-col h-screen p-8 ${
        activeTab === 'new' ? 'overflow-auto' : 'none'
      }`}
    >
      <h1 className="text-2xl font-bold mb-4">Quản lý chứng chỉ</h1>
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/" className="hover:underline">
          Tổng quan
        </Link>
        <span className="mx-2">/</span>
        <Link to="/certificates" className="hover:underline">
          Chứng chỉ
        </Link>
      </nav>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          className={`px-6 py-2 font-semibold rounded-lg ${
            activeTab === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('new')}
        >
          Cấp Chứng chỉ Mới
        </button>
        <button
          className={`px-6 py-2 font-semibold rounded-lg ${
            activeTab === 'issued' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('issued')}
        >
          Danh Sách Chứng chỉ
        </button>
      </div>

      {/* Nội dung của từng tab */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'new' ? <NewCertificate /> : <IssuedCertificates />}
      </div>
    </div>
  )
}

const NewCertificate = () => {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [date, setDate] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')
  const [tempCertificateUrl, setTempCertificateUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [storedCourseCode, setStoredCourseCode] = useState('') // Tạm lưu courseCode để cấp chứng chỉ sau

  // Fetch danh sách người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/users')
        const data = await response.json()
        setUsers(data.users)
      } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const selectedUser = users.find((user) => user._id === selectedUserId)
    if (selectedUser) {
      setName(selectedUser.name)
    } else {
      setName('')
    }
  }, [selectedUserId, users])

  // Hàm vẽ chứng chỉ
  const drawCertificate = (courseCode, isPreview = false) => {
    return new Promise((resolve, reject) => {
      if (!courseCode) {
        console.error('Thiếu dữ liệu để vẽ chứng chỉ.')
        reject(new Error('CourseCode bị thiếu'))
        return
      }

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const image = new Image()
      image.src = '/certificate_VLUTE.png'
      image.onload = async () => {
        canvas.width = image.width
        canvas.height = image.height
        context?.drawImage(image, 0, 0)

        context.font = '130px Arial bold'
        context.fillStyle = 'green'
        context?.fillText(name, 150, 800)

        context.font = 'bold 40px Arial'
        context.fillStyle = 'red'
        context?.fillText(course, 750, 866)

        context.font = 'bold 35px Arial'
        context.fillStyle = 'black'
        context?.fillText(`Ngày cấp: ${date}`, 150, 1000)

        context.font = 'bold 40px Arial'
        context.fillStyle = 'black'
        context?.fillText(courseCode, 1450, 95)

        // **Tạo mã QR chứa URL với courseCode**
        const qrData = `http://localhost:5000/api/auth/verify?courseCode=${encodeURIComponent(
          courseCode
        )}`

        const qrCanvas = document.createElement('canvas')
        await QRCode.toCanvas(qrCanvas, qrData, { width: 200 })

        context?.drawImage(qrCanvas, canvas.width - 850, canvas.height - 300)

        const dataUrl = canvas.toDataURL()

        if (isPreview) {
          setTempCertificateUrl(dataUrl)
        } else {
          setCertificateUrl(dataUrl)
        }
        setShowPreview(true)
        resolve(dataUrl) // Trả về dataUrl khi chứng chỉ đã được vẽ
      }

      image.onerror = (error) => {
        console.error('Error loading certificate image:', error)
        reject(error)
      }
    })
  }

  // Gửi yêu cầu đến backend để cấp chứng chỉ
  const handleCertificateIssue = async () => {
    if (!selectedUserId) {
      alert('Vui lòng chọn người nhận')
      return
    }

    try {
      // Gửi yêu cầu tạo chứng chỉ và nhận lại thông tin
      const response = await fetch('http://localhost:5000/api/auth/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUserId,
          recipientName: name,
          courseName: course,
          issueDate: date
        })
      })

      const data = await response.json()
      if (response.ok) {
        const { courseCode } = data

        // Vẽ chứng chỉ với mã QR chứa URL với courseCode
        const finalDataUrl = await drawCertificate(courseCode)

        // Chuyển đổi ảnh sang buffer và lưu lên IPFS
        const base64Data = finalDataUrl.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        const result = await ipfs.add(buffer)
        const ipfsCID = result.cid.toString()

        console.log('CID từ IPFS:', ipfsCID)

        // Gửi finalize để lưu chứng chỉ thực
        const finalizeResponse = await fetch(
          'http://localhost:5000/api/auth/finalize',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: selectedUserId,
              recipientName: name,
              courseName: course,
              issueDate: date,
              courseCode,
              dataUrl: finalDataUrl,
              ipfsCID
            })
          }
        )

        const finalizeData = await finalizeResponse.json()
        if (finalizeResponse.ok) {
          setCertificateUrl(finalDataUrl)
          alert('Chứng chỉ đã được cấp thành công!')
        } else {
          alert(`Lỗi: ${finalizeData.message}`)
        }
      } else {
        alert(`Lỗi: ${data.message}`)
      }
    } catch (error) {
      console.error('Lỗi khi cấp chứng chỉ:', error)
      alert('Đã có lỗi xảy ra khi cấp chứng chỉ.')
    }
  }

  // Xử lý khi nhấn nút "Xem Trước"
  const handlePreview = async () => {
    try {
      // Vẽ chứng chỉ xem trước với dữ liệu mẫu
      await drawCertificate('DEMO-COURSECODE', true)
    } catch (error) {
      console.error('Lỗi khi xem trước chứng chỉ:', error)
      alert('Không thể xem trước chứng chỉ.')
    }
  }

  // Hàm để hoàn tất việc cấp chứng chỉ với `courseCode`
  const finalizeCertificateIssue = async (courseCode, ipfsCID, dataUrl) => {
    if (!dataUrl) {
      alert('Vui lòng tạo chứng chỉ trước')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUserId,
          recipientName: name,
          courseName: course,
          issueDate: date,
          courseCode,
          ipfsCID,
          dataUrl
        })
      })

      const result = await response.json()
      if (response.ok) {
        alert('Chứng chỉ đã được cấp thành công!')
      } else {
        alert(`Lỗi: ${result.message}`)
      }
    } catch (error) {
      console.error('Lỗi khi cấp chứng chỉ:', error)
      alert('Đã có lỗi xảy ra khi cấp chứng chỉ')
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Cấp Chứng Chỉ Mới</h2>
      <form className="space-y-4 max-w-lg mx-auto">
        <div>
          <label className="block text-sm font-semibold mb-1 text-left">
            Người Nhận
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="">Chọn người nhận</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1 text-left">
            Tên Chứng Chỉ
          </label>
          <input
            type="text"
            placeholder="Nhập tên chứng chỉ"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-left">
            Ngày Cấp
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="button"
          onClick={handlePreview}
          className="w-full py-2 mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
        >
          Xem Trước
        </button>

        <button
          type="button"
          onClick={handleCertificateIssue}
          className="w-full py-2 mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
        >
          Cấp Chứng Chỉ
        </button>
      </form>

      {tempCertificateUrl && (
        <div className="mt-8">
          <h3
            className="text-lg font-semibold mb-4 cursor-pointer px-4 py-2 bg-yellow-600 border-black rounded-lg inline-block text-white transition-transform transform hover:scale-105"
            onClick={() => setShowPreview(!showPreview)}
          >
            Xem Trước
          </h3>
          {showPreview && (
            <div className="flex justify-center transition-all duration-500 transform opacity-100 translate-y-0">
              <img
                width="800px"
                src={tempCertificateUrl}
                alt="Xem trước"
                className="border rounded-lg shadow-lg max-w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const IssuedCertificates = () => {
  const [data, setData] = useState([])
  const navigate = useNavigate()

  const columns = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Tên Người Nhận' },
    { name: 'certificate', label: 'Tên Chứng Chỉ' },
    { name: 'issuedDate', label: 'Ngày Cấp' },
    {
      name: '_id',
      label: 'Xem Chứng Chỉ',
      options: {
        filter: false,
        customBodyRender: (value) => (
          <a
            href={`http://localhost:5000/api/auth/view/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Xem
          </a>
        )
      }
    },
    {
      name: 'blockchainTxHash', 
      label: 'Chi Tiết',
      options: {
        filter: false,
        customBodyRender: (value) => (
          <button
            onClick={() => navigate(`/information?txHash=${value}`)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Chi Tiết
          </button>
        )
      }
    }
  ]

  const options = {
    selectableRows: 'none',
    responsive: 'standard',
    elevation: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10],
    tableBodyHeight: '300px',
    tableBodyMaxHeight: '800px'
  }

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/auth/certificates'
        )
        const result = await response.json()
        setData(result.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách chứng chỉ:', error)
      }
    }
    fetchCertificates()
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Danh Sách Chứng Chỉ Đã Cấp
      </h2>
      <MUIDataTable
        title={'Danh Sách'}
        data={data}
        columns={columns}
        options={options}
      />
    </div>
  )
}

export default CertificatePage
