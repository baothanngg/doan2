import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MUIDataTable from 'mui-datatables'
import QRCode from 'qrcode'

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
          Tổng Số Chứng chỉ Đã Cấp
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
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [date, setDate] = useState('')
  const [certificateUrl, setCertificateUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const drawCertificate = async () => {
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

      const qrData = `${name} - ${course} - ${date}`
      const qrCanvas = document.createElement('canvas')
      await QRCode.toCanvas(qrCanvas, qrData, { width: 200 })

      context?.drawImage(qrCanvas, canvas.width - 850, canvas.height - 300)

      const dataUrl = canvas.toDataURL()
      setCertificateUrl(dataUrl)
      setShowPreview(true) // Mở phần xem trước khi nhấn "Xem Trước"
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4">Cấp Chứng chỉ Mới</h2>
      <form className="space-y-4 max-w-lg mx-auto">
        <div>
          <label className="block text-sm font-semibold mb-1 text-left">
            Tên Người Nhận
          </label>
          <input
            type="text"
            placeholder="Nhập tên người nhận"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 text-left">
            Tên Chứng chỉ
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

        {/* Nút Xem Trước */}
        <button
          type="button"
          onClick={drawCertificate}
          className="w-full py-2 mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
        >
          Xem Trước
        </button>

        {/* Nút Cấp Chứng Chỉ */}
        <button
          type="button"
          className="w-full py-2 mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
        >
          Cấp Chứng Chỉ
        </button>
      </form>

      {/* Hiển thị chứng chỉ đã vẽ với hiệu ứng cuộn mở/đóng */}
      {certificateUrl && (
        <div className="mt-8">
          <h3
            className="text-lg font-semibold mb-4 cursor-pointer px-4 py-2 bg-yellow-600 border-black rounded-lg inline-block text-white transition-transform transform hover:scale-105"
            onClick={() => setShowPreview(!showPreview)}
          >
            Chứng Chỉ Xem Trước
          </h3>
          {showPreview && (
            <div
              className={`transition-all duration-500 transform ${
                showPreview
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 -translate-y-4'
              }`}
            >
              <img
                src={certificateUrl}
                alt="Chứng chỉ xem trước"
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
  const columns = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'Tên Người Nhận' },
    { name: 'certificate', label: 'Tên Chứng chỉ' },
    { name: 'issuedDate', label: 'Ngày Cấp' }
  ]

  const options = {
    selectableRows: 'none',
    responsive: 'standard',
    elevation: 0,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10],
    tableBodyHeight: '500px',
    tableBodyMaxHeight: '800px'
  }

  const data = [
    {
      id: '001',
      name: 'Nguyen Van A',
      certificate: 'Data Science',
      issuedDate: '2023-01-15'
    },
    {
      id: '002',
      name: 'Tran Thi B',
      certificate: 'Web Development',
      issuedDate: '2023-05-10'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Tổng Số Chứng chỉ Đã Cấp
      </h2>
      <MUIDataTable
        title={'Danh Sách Chứng Chỉ'}
        data={data}
        columns={columns}
        options={options}
      />
    </div>
  )
}

export default CertificatePage
